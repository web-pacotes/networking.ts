import { HttpRequest, HttpRequestError, HttpResponse } from "../models";

/**
 * Specifies a general purpose interceptor, being able to capture and modify {@link HttpRequest} before sending a request,
 * {@link HttpResponse} before finishing the client call and {@link HttpRequestError} in case of errors.
 */
export interface Interceptor {
    /**
     * Intercepts a request before contacting the server.
     * 
     * @param request - the intercepted http request
     */
    onRequest(request: HttpRequest): HttpRequest;

    /**
     * Intercepts a response before returning it to the caller.
     * 
     * @param response - the intercepted http response
     */
    onResponse(response: HttpResponse): HttpResponse;

    /**
     * Intercepts a request error before returning it to the caller.
     * 
     * @param request - the intercepted http request error
     */
    onError(error: HttpRequestError): HttpRequestError;
}

/**
 * Defines an {@link Interceptor} for intercepting http requests.
 */
export abstract class RequestInterceptor implements Interceptor {
    abstract onRequest(request: HttpRequest): HttpRequest;

    onResponse(response: HttpResponse): HttpResponse {
        return response;
    }

    onError(error: HttpRequestError): HttpRequestError {
        return error;
    }
}

/**
 * Defines an {@link Interceptor} for intercepting http responses.
 */
export abstract class ResponseInterceptor implements Interceptor {
    abstract onResponse(request: HttpResponse): HttpResponse;

    onRequest(request: HttpRequest): HttpRequest {
        return request;
    }

    onError(error: HttpRequestError): HttpRequestError {
        return error;
    }
}

/**
 * Defines an {@link Interceptor} for intercepting http request errors.
 */
export abstract class ErrorInterceptor implements Interceptor {
    abstract onError(error: HttpRequestError): HttpRequestError;

    onRequest(request: HttpRequest): HttpRequest {
        return request;
    }

    onResponse(response: HttpResponse): HttpResponse {
        return response;
    }
}