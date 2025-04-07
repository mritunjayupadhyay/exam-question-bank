// src/common/interceptors/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ResponseDto } from './dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Get the HTTP status from the response
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        
        // Transform successful responses
        return ResponseDto.success(data, statusCode);
      }),
      catchError(err => {
        // Handle exceptions
        const status = err instanceof HttpException ? err.getStatus() : 500;
        const message = err instanceof HttpException ? 
          err.getResponse()['message'] || err.message : 
          'Internal server error';
        
        return throwError(() => new HttpException(
          ResponseDto.error(message, status),
          status
        ));
      }),
    );
  }
}