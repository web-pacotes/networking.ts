import { Range } from '../type-utils';
import {
	Anything,
	Binary,
	HttpBody,
	JSON,
	JSONArray,
	empty,
	extract,
	of
} from './body';
import { HttpError } from './errors';
import { HttpHeaders } from './headers';
import { MediaType, tryParseContentType } from './media_type';

/**
 * Alias for {@link HttpResponse} class properties in a positional style.
 */
type HttpResponsePositionalProperties = Pick<
	HttpResponse,
	'body' | 'headers' | 'mediaType' | 'statusCode'
> & { stringify: boolean };

// Alias for concrete {@link HttpResponse} classes constructors.

type InformationalHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify' | 'body'
>;

type SuccessfulHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { stringify?: boolean };

type RedirectionHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify' | 'body'
> & { location: URL };

type ClientErrorHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { stringify?: boolean };

type ServerErrorHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { stringify?: boolean };

type BinaryHttpResponse = Omit<HttpResponse, 'body'> & {
	body: HttpBody<Binary>;
};
type PlainTextHttpResponse = Omit<HttpResponse, 'body'> & {
	body: HttpBody<Text>;
};
type JsonHttpResponse = Omit<HttpResponse, 'body'> & {
	body: HttpBody<JSON | JSONArray>;
};
type ImageHttpResponse = BinaryHttpResponse;

/**
 * Types an HTTP response. Property stringify indicates whether or not the response body
 * should be used when creating a string representation of the response.
 */
export abstract class HttpResponse {
	readonly body: HttpBody;

	readonly mediaType: MediaType;

	readonly statusCode: number;

	readonly headers: HttpHeaders;

	readonly stringify: boolean;

	/**
	 * Converts a fetch {@link Response} in a {@link HttpResponse}.
	 *
	 * @param response - a response that follows the Fetch API response schema.
	 * @returns a {@link HttpResponse} instance that translates the fetch response.
	 */
	static fromFetchResponse(response: Response) {
		const { statusCode, mediaType, headers } = extractEssential(response);
		const body = extractBody(response, mediaType, statusCode);

		return buildHttpResponse(statusCode, mediaType, headers, body);
	}

	/**
	 * Converts a fetch {@link Response} in a {@link HttpResponse}.
	 * The same as {@link fromFetchResponse} but eager loads the response body.
	 *
	 * @param response - a response that follows the Fetch API response schema.
	 * @returns a {@link HttpResponse} instance that translates the fetch response.
	 */
	static async fromEagerFetchResponse(response: Response) {
		const { statusCode, mediaType, headers } = extractEssential(response);
		let body = extractBody(response, mediaType, statusCode);

		if (body) {
			body = await extract(body);
		}

		return buildHttpResponse(statusCode, mediaType, headers, body);
	}

	constructor({
		body,
		headers,
		mediaType,
		statusCode,
		stringify
	}: HttpResponsePositionalProperties) {
		this.body = body;
		this.mediaType = mediaType;
		this.statusCode = statusCode;
		this.headers = headers;
		this.stringify = stringify;
	}

	/**
	 * Checks if the response is "ok" (if it's either {@link InformationalHttpResponse}, {@link SuccessfulHttpResponse} or {@link RedirectionHttpResponse}).
	 *
	 * @returns true if response type matches the ok response types.
	 */
	ok(): boolean {
		return !this.notOk();
	}

	/**
	 * Checks if the response is "not ok" (if it's either {@link ClientErrorHttpResponse}, or {@link ServerErrorHttpResponse}).
	 *
	 * @returns true if response type matches the ok response types.
	 */
	notOk(): boolean {
		return isClientErrorResponse(this) || isServerErrorResponse(this);
	}

	/**
	 * Checks if the response is redirecting to a different resource/url.
	 *
	 * @returns true if response type matches {@link RedirectionHttpResponse}.
	 */
	redirection(): this is RedirectionHttpResponse {
		return isRedirectionResponse(this);
	}

	/**
	 * Casts the response body as of type {@link HttpBody<T>}. Useful to extract the body to a specific type.
	 *
	 * **Unsafe** method!
	 *
	 * @returns a typed version of HttpBody
	 */
	typedBody<T extends Anything>(): HttpBody<T> {
		return this.body as HttpBody<T>;
	}

	toString(): string {
		return `${this.constructor.name}(Status Code: ${
			this.statusCode
		} | Headers: ${this.headers} | Body: ${
			this.stringify ? extract(this.body) : '...'
		})`;
	}
}

/**
 * Types an HTTP response that is classified as a informational response (status code: **100**-**199**).
 */
export class InformationalHttpResponse extends HttpResponse {
	constructor({
		headers,
		mediaType,
		statusCode
	}: InformationalHttpResponsePositionalProperties) {
		super({
			body: empty(),
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: false
		});
	}
}

/**
 * Types an HTTP response that is classified as a successful response (status code: **200**-**299**).
 */
export class SuccessfulHttpResponse extends HttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode,
		stringify
	}: SuccessfulHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: stringify ?? true
		});
	}
}

/**
 * Types an HTTP response that is classified as a redirection response (status code: **300**-**399**).
 */
export class RedirectionHttpResponse extends HttpResponse {
	readonly location: URL;

	constructor({
		headers,
		mediaType,
		statusCode,
		location
	}: RedirectionHttpResponsePositionalProperties) {
		super({
			body: empty(),
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: false
		});

		this.location = location;
	}
}

/**
 * Types an HTTP response that is classified as a client error response (status code: **400**-**499**).
 */
export class ClientErrorHttpResponse extends HttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode,
		stringify
	}: ClientErrorHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: stringify ?? true
		});
	}

	toHttpError(): HttpError {
		return new HttpError({ statusCode: this.statusCode as Range<400, 500> });
	}
}

/**
 * Types an HTTP response that is classified as a server error response (status code: **500**-**599**).
 */
export class ServerErrorHttpResponse extends HttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode,
		stringify
	}: ServerErrorHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: stringify ?? true
		});
	}

	toHttpError(): HttpError {
		return new HttpError({ statusCode: this.statusCode as Range<500, 600> });
	}
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link InformationalHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link InformationalHttpResponse}, false otherwise.
 */
export function isInformationResponse(
	response: HttpResponse
): response is InformationalHttpResponse {
	return response instanceof InformationalHttpResponse;
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link SuccessfulHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link SuccessfulHttpResponse}, false otherwise.
 */
export function isSuccessfulResponse(
	response: HttpResponse
): response is SuccessfulHttpResponse {
	return response instanceof SuccessfulHttpResponse;
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link RedirectionHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link RedirectionHttpResponse}, false otherwise.
 */
export function isRedirectionResponse(
	response: HttpResponse
): response is RedirectionHttpResponse {
	return response instanceof RedirectionHttpResponse;
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link ClientErrorHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link ClientErrorHttpResponse}, false otherwise.
 */
export function isClientErrorResponse(
	response: HttpResponse
): response is ClientErrorHttpResponse {
	return response instanceof ClientErrorHttpResponse;
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link ServerErrorHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link ServerErrorHttpResponse}, false otherwise.
 */
export function isServerErrorResponse(
	response: HttpResponse
): response is ServerErrorHttpResponse {
	return response instanceof ServerErrorHttpResponse;
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link BinaryHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link BinaryHttpResponse}, false otherwise.
 */
export function isBinaryResponse(
	response: HttpResponse
): response is BinaryHttpResponse {
	return isBinaryMediaType(response.mediaType);
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link JsonHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link JsonHttpResponse}, false otherwise.
 */
export function isJsonResponse(
	response: HttpResponse
): response is JsonHttpResponse {
	return isJsonMediaType(response.mediaType);
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link PlainTextHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link PlainTextHttpResponse}, false otherwise.
 */
export function isPlainTextResponse(
	response: HttpResponse
): response is PlainTextHttpResponse {
	return isPlainTextMediaType(response.mediaType);
}

/**
 * Checks if a {@link HttpResponse} is an instance of {@link ImageHttpResponse}, providing a
 * type guard for that type.
 *
 * @param response - the response instance being checked
 * @returns boolean true if the response is an instance of {@link ImageHttpResponse}, false otherwise.
 */
export function isImageResponse(
	response: HttpResponse
): response is ImageHttpResponse {
	return isImageMediaType(response.mediaType);
}

function isBinaryMediaType(mediaType: MediaType): boolean {
	switch (mediaType) {
		case MediaType.binary:
		case MediaType.zip:
		case MediaType.gzip:
		case MediaType.pdf:
			return true;
		default:
			return isImageMediaType(mediaType);
	}
}

function isJsonMediaType(mediaType: MediaType): boolean {
	switch (mediaType) {
		case MediaType.json:
		case MediaType.jsonld:
			return true;
		default:
			return false;
	}
}

function isPlainTextMediaType(mediaType: MediaType): boolean {
	switch (mediaType) {
		case MediaType.html:
		case MediaType.js:
		case MediaType.plainText:
		case MediaType.xhtml:
		case MediaType.xml:
			return true;
		default:
			return false;
	}
}

function isImageMediaType(mediaType: MediaType): boolean {
	return mediaType.startsWith('image/');
}

function buildHttpResponse(
	statusCode: number,
	mediaType: MediaType,
	headers: HttpHeaders,
	body: HttpBody
) {
	if (statusCode > 499) {
		return new ServerErrorHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode as Range<500, 600>,
			body: body
		});
	} else if (statusCode > 399) {
		return new ClientErrorHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode as Range<400, 500>,
			body: body
		});
	} else if (statusCode > 299) {
		return new RedirectionHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode as Range<300, 400>,
			location: new URL(headers['location'])
		});
	} else if (statusCode > 199) {
		return new SuccessfulHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode as Range<200, 300>,
			body: body
		});
	} else {
		return new InformationalHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode as Range<100, 200>
		});
	}
}

function extractEssential(response: Response) {
	const headers = Object.fromEntries(response.headers);

	return {
		statusCode: response.status,
		headers: headers as HttpHeaders,
		mediaType: tryParseContentType(headers['content-type'])
	};
}

function extractBody(
	response: Response,
	mediaType: MediaType,
	statusCode: number
) {
	if (statusCode < 200 || (statusCode > 299 && statusCode < 400)) {
		return empty();
	}

	if (isJsonMediaType(mediaType)) {
		return of(() => response.json());
	} else if (isBinaryMediaType(mediaType)) {
		return of(() => response.blob());
	} else {
		return of(() => response.text());
	}
}
