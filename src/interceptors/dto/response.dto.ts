// src/common/dto/response.dto.ts
export class ResponseDto<T> {
    error: boolean;
    data?: T;
    message?: string[];
    status: number;
  
    static success<T>(data: T, status: number = 200): ResponseDto<T> {
      return {
        error: false,
        data,
        status,
      };
    }
  
    static error(message: string | string[], status: number = 400): ResponseDto<null> {
      const messages = Array.isArray(message) ? message : [message];
      return {
        error: true,
        message: messages,
        status,
      };
    }
  }