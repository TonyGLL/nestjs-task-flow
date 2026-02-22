import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

/**
 * AllExceptionsFilter is a global filter that catches all unhandled exceptions.
 * It formats the error response into a consistent JSON structure.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * Method called when an exception is caught.
   * @param exception The caught exception object.
   * @param host The execution context.
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle NestJS built-in HttpExceptions.
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' ? (res as any).message || res : res;
      error = (res as any).error || exception.name;
    }
    // Handle custom DomainExceptions defined in our business logic.
    else if (exception instanceof DomainException) {
      status = exception.status;
      message = exception.message;
      error = exception.name;
    }
    // Handle generic JavaScript Errors.
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      // Map specific error names to appropriate HTTP status codes.
      if (exception.name === 'UnauthorizedError') {
          status = HttpStatus.UNAUTHORIZED;
      }
    }

    // Build the standardized error response body.
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    };

    // Log the error. Use 'error' level for 5xx and 'warn' for others.
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status} - Error: ${JSON.stringify(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    // Send the response back to the client.
    response.status(status).json(responseBody);
  }
}
