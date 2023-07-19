/**
 * Alias for {@link HttpRequestError} class properties in a positional style.
 */
export type HttpRequestErrorPositionalProperties = { cause: string };

// Alias for concrete {@link HttpRequestError} classes constructors.
type NoInternetConnectionErrorPositionalProperties = Omit<HttpRequestErrorPositionalProperties, 'cause'> & { cause?: string };
type TimeoutErrorPositionalProperties = Omit<HttpRequestErrorPositionalProperties, 'cause'> & { cause?: string, timeoutMS: number };
type UnknownErrorPositionalProperties = Omit<HttpRequestErrorPositionalProperties, 'cause'> & { cause?: string };

/**
 * Types an error which originates before or after sending an HTTP request.
 */
export abstract class HttpRequestError extends Error {
    constructor({ cause }: HttpRequestErrorPositionalProperties) {
        super(cause)
    }
}

/**
 * Types a {@link HttpRequestError} for when a HTTP request is sent, but couldn't be delivered because there is no internet connection available.
 */
export class NoInternetConnectionError extends HttpRequestError {
    constructor({ cause }: NoInternetConnectionErrorPositionalProperties) {
        super({ cause: cause ?? 'no internet connection available' });
    }
}

/**
 * Types a {@link HttpRequestError} for when a HTTP request is sent, but the server timesout to reply with a response.
 */
export class TimeoutError extends HttpRequestError {
    readonly timeoutMS: number;

    constructor({ cause = 'request timed out', timeoutMS }: TimeoutErrorPositionalProperties) {
        super({ cause: cause });

        this.timeoutMS = timeoutMS;
    }

    toString(): string {
        return `timeout (ms): ${this.timeoutMS}\n${super.toString()}`;
    }
}

/**
 * Types a {@link HttpRequestError} for when a HTTP request errors in an unknown manner, either before sending it or when attempting to deconstruct the response- 
 */
export class UnknownError extends HttpRequestError {
    constructor({ cause }: UnknownErrorPositionalProperties) {
        super({ cause: cause ?? 'something really weird just happened' });
    }
}
