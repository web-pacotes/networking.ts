import { Range } from "../../type-utils";
import { HttpRequestError, HttpRequestErrorPositionalProperties } from "./request_error";

type HttpErrorPositionalProperties = Omit<HttpRequestErrorPositionalProperties, 'cause'> & { cause?: string, statusCode: Range<400, 600> };

/**
 * Types a {@link HttpRequestError} for client and server side error responses.
 */
export class HttpError extends HttpRequestError {

    statusCode: number;

    constructor({ cause, statusCode }: HttpErrorPositionalProperties) {
        super({ cause: cause ?? `status code: ${statusCode}` });

        this.statusCode = statusCode;
    }

}