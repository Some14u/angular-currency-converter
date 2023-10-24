import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ErrorMessage } from '../enums/error-message.enum';
import { Observable, throwError } from 'rxjs';

export const handleServiceError = (error: any): Observable<never> => {
  if (
    error instanceof HttpErrorResponse &&
    error.status === HttpStatusCode.TooManyRequests
  ) {
    return throwError(
      () => new Error(ErrorMessage.API_REQUESTS_LIMIT_EXCEEDED)
    );
  }

  return throwError(() => new Error(ErrorMessage.DEFAULT_ERROR));
};
