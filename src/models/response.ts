import { Range } from '../type-utils';
import { HttpBody } from './body';
import { HttpHeaders } from './headers';
import { MediaType } from './media_type';

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
> & { statusCode: Range<100, 200> };
type SuccessfulHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { statusCode: Range<200, 300>; stringify?: boolean };
type RedirectionHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify' | 'body'
> & { statusCode: Range<300, 400>; location: URL };
type ClientErrorHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { statusCode: Range<400, 500>; stringify?: boolean };
type ServerErrorHttpResponsePositionalProperties = Omit<
	HttpResponsePositionalProperties,
	'stringify'
> & { statusCode: Range<500, 600>; stringify?: boolean };
type JsonHttpResponsePositionalProperties =
	SuccessfulHttpResponsePositionalProperties & {
		mediaType: MediaType.json | MediaType.jsonld;
	};
type ImageHttpResponsePositionalProperties =
	SuccessfulHttpResponsePositionalProperties & {
		mediaType:
			| MediaType.jpeg
			| MediaType.png
			| MediaType.bmp
			| MediaType.gif
			| MediaType.svg
			| MediaType.tiff
			| MediaType.webp;
	};
type PlainTextHttpResponsePositionalProperties =
	SuccessfulHttpResponsePositionalProperties & {
		mediaType: MediaType.plainText;
	};
type BinaryTextHttpResponsePositionalProperties =
	SuccessfulHttpResponsePositionalProperties & { mediaType: MediaType.binary };

/**
 * Types an HTTP response. Property stringify indicates whether or not the response body
 * should be used when creating a string representation of the response.
 */
export abstract class HttpResponse {
	readonly body: HttpBody;

	readonly mediaType: MediaType;

	readonly statusCode: number;

	readonly headers: HttpHeaders;

	private stringify: boolean;

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
		return (
			this instanceof ClientErrorHttpResponse ||
			this instanceof ServerErrorHttpResponse
		);
	}

	/**
	 * Checks if the response is redirecting to a different resource/url.
	 *
	 * @returns true if response type matches {@link RedirectionHttpResponse}.
	 */
	redirection(): boolean {
		return this instanceof RedirectionHttpResponse;
	}

	toString(): string {
		return `${this.constructor.name}(Status Code: ${
			this.statusCode
		} | Headers: ${this.headers} | Body: ${
			this.stringify ? this.body.toString('utf8') : '...'
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
			body: <HttpBody>{},
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
			body: <HttpBody>{},
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
}

/**
 * Types a successful HTTP response which media type is {@link MediaType.json} or {@link MediaType.jsonld}.
 */
export class JsonHttpResponse extends SuccessfulHttpResponse {
	constructor({
		body,
		headers,
		mediaType = MediaType.json,
		statusCode
	}: JsonHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode
		});
	}
}

/**
 * Types a successful HTTP response which media type starts with `image/...`
 */
export class ImageHttpResponse extends SuccessfulHttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode
	}: ImageHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: false
		});
	}
}

/**
 * Types an successful HTTP response which media type is {@link MediaType.plainText}.
 */
export class PlainTextHttpResponse extends SuccessfulHttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode
	}: PlainTextHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode
		});
	}
}

/**
 * Types an successful HTTP response which media type is {@link MediaType.binary}.
 */
export class BinaryHttpResponse extends SuccessfulHttpResponse {
	constructor({
		body,
		headers,
		mediaType,
		statusCode
	}: BinaryTextHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: false
		});
	}
}
