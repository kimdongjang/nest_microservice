import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Request, Response } from 'express';

/**
 * 페이로드 검증을 위해 DTO(Data-Transfer-Object) 파일을 사용할 때 HTTP로 통신하는 과정에서 class-validator를 사용해 유효성 검사를 하는데,
 * gRPC 서버에서 HTTP 예외처리를 하는 것이 아닌, HTTP로 통신하는 서버에서 예외처리를 진행해야 함.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const res: Response = ctx.getResponse<Response>();
    const req: Request = ctx.getRequest<Request>();
    const status: HttpStatus = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const res: any = exception.getResponse();

      return { status, error: res.message };
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
