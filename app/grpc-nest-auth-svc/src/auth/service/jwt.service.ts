import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService as Jwt } from '@nestjs/jwt';
import { Auth } from '../auth.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtService {
  @InjectRepository(Auth)
  private readonly authRepository: Repository<Auth>;
  private readonly jwt: Jwt;

  constructor(jwt: Jwt) {
    this.jwt = jwt;
  }

  // jwt token을 디코딩함
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token);
  }

  // 디코딩된 데이터에서 유저 아이디를 통해 유저를 가져옴
  public async validateUser(decoded: any): Promise<Auth> {
    return this.authRepository.findOne({ where: { id: decoded.id } });
  }

  // 아이디와 이메일을 통해 jwt token을 실행함
  public generateToken(auth: Auth): string {
    return this.jwt.sign({ id: auth.id, email: auth.email });
  }

  // 유저 패스워드가 유효한지 확인함
  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  // 유저 패스워드를 인코딩함
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  public async verify(token: string): Promise<any> {
    try {
      return this.jwt.verify(token);
    } catch (err) {
      throw new ForbiddenException(err);
    }
  }
}
