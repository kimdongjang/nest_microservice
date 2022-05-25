import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ValidateResponse } from './auth.pb';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(AuthService)
  public readonly service: AuthService;

  /**
   * 서비스를 이용할 수 있는지 확인
   * @param context
   */
  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | never {
    // 요청을 http로 변경
    const req: Request = context.switchToHttp().getRequest();
    const authorization: string = req.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException();
    }

    // JWT 토큰 인증을 위한 bearer 토큰
    const bearer: string[] = authorization.split(' ');

    if (!bearer || bearer.length < 2) {
      throw new UnauthorizedException();
    }

    const token: string = bearer[1];

    // 사용자의 토큰이 유효한지 확인해서 응답객체를 초기화
    const { status, userId }: ValidateResponse = await this.service.valiate(
      token,
    );
    req.user = userId;

    if (status !== HttpStatus.OK) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
