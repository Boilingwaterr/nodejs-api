export enum ErrorStatusCode {
  BadRequest = 400,
  Internal = 500,
  Conflict = 409
}

interface IApiError {
  code: ErrorStatusCode;
  message: string;
}

const buildApiError = (
  code: IApiError['code'],
  message: IApiError['message']
): IApiError => ({ code, message });

export const badRequestError = (message: IApiError['message']): IApiError =>
  buildApiError(ErrorStatusCode.BadRequest, message);

export const internalError = (message: IApiError['message']): IApiError =>
  buildApiError(ErrorStatusCode.Internal, message);

export class ApiError extends Error {}
