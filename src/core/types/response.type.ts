/**
 * RESPONSE TYPE BASE ON: https://jsonapi.org/format/#fetching-pagination
 */

import { HTTPException } from 'hono/http-exception';
import { ContentfulStatusCode } from 'hono/utils/http-status';

interface ErrorDetailResponse {
  code: string;
  title: string;
  detail: string;
}

interface StatusResponse {
  code: ContentfulStatusCode;
  message: string;
}

interface PaginationResponse {
  /**
   * The current page number.
   */
  number: number;

  /**
   * The number of items per page.
   */
  size: number;

  totalPages: number;
  totalItems: number;
}

interface MetaResponse {
  /**
   * The pagination metadata.
   */
  page?: PaginationResponse;
}

export class SuccessResponse<DataType> extends Response {
  public constructor(data: DataType, args?: { meta?: MetaResponse }) {
    super(JSON.stringify({ status: { code: 200, message: 'Success' }, data, meta: args?.meta }), { status: 200 });
  }
}

export class ErrorResponse extends HTTPException {
  public constructor(status: StatusResponse, errors: ErrorDetailResponse[]) {
    super(status.code, { res: new Response(JSON.stringify({ status, errors }), { status: status.code }) });
  }
}

function createHttpException(statusCode: ContentfulStatusCode, defaultMessage: string) {
  return class extends ErrorResponse {
    public constructor();
    public constructor(message: string);
    public constructor(message: string, errors: ErrorDetailResponse[]);
    public constructor(errors: ErrorDetailResponse[]);

    public constructor(messageOrErrors?: string | ErrorDetailResponse[], errors?: ErrorDetailResponse[]) {
      if (Array.isArray(messageOrErrors)) {
        super({ code: statusCode, message: defaultMessage }, messageOrErrors);
      } else {
        super({ code: statusCode, message: messageOrErrors ?? defaultMessage }, errors ?? []);
      }
    }
  };
}

export const BadRequestException = createHttpException(400, 'Bad Request');
export const UnauthorizedException = createHttpException(401, 'Unauthorized');
export const ForbiddenException = createHttpException(403, 'Forbidden');
export const NotAcceptableException = createHttpException(406, 'Not Acceptable');
export const ConflictException = createHttpException(409, 'Conflict');
