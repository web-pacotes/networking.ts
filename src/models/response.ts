import { Range } from '../type-utils';
import { HttpBody, extract, of } from './body';
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

	/**
	 * Converts a fetch {@link Response} in a {@link HttpResponse}.
	 *
	 * @param response - a response that follows the Fetch API response schema.
	 * @returns a {@link HttpResponse} instance that translates the fetch response.
	 */
	static fromFetchResponse(response: Response): HttpResponse {
		const { statusCode, mediaType, headers } = extractEssential(response);

		if (statusCode > 499) {
			return new ServerErrorHttpResponse({
				headers: headers,
				mediaType: mediaType,
				statusCode: statusCode as Range<500, 600>,
				body: extractBody(response, mediaType),
			});
		} else if (statusCode > 399) {
			return new ClientErrorHttpResponse({
				headers: headers,
				mediaType: mediaType,
				statusCode: statusCode as Range<400, 500>,
				body: extractBody(response, mediaType),
			});
		} else if (statusCode > 299) {
			return new RedirectionHttpResponse({
				headers: headers,
				mediaType: mediaType,
				statusCode: statusCode as Range<300, 400>,
				location: new URL(headers['location']),
			});
		} else if (statusCode > 199) {
			return new SuccessfulHttpResponse({
				headers: headers,
				mediaType: mediaType,
				statusCode: statusCode as Range<200, 300>,
				body: extractBody(response, mediaType),
			});
		} else {
			return new InformationalHttpResponse({
				headers: headers,
				mediaType: mediaType,
				statusCode: statusCode as Range<100, 200>,
			});
		}
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
		return `${this.constructor.name}(Status Code: ${this.statusCode
			} | Headers: ${this.headers} | Body: ${this.stringify ? extract(this.body) : '...'
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

function extractEssential(response: Response) {
	const headers = Object.fromEntries(response.headers);

	return {
		statusCode: response.status,
		headers: headers as HttpHeaders,
		mediaType: tryParseContentType(headers['content-type'])
	};
}

function extractBody(response: Response, mediaType: MediaType) {
	switch (mediaType) {
		case MediaType.avif:
		case MediaType.bmp:
		case MediaType.gif:
		case MediaType.ico:
		case MediaType.jpeg:
		case MediaType.png:
		case MediaType.svg:
		case MediaType.tiff:
		case MediaType.webp:
		case MediaType.binary:
		case MediaType.zip:
		case MediaType.gzip:
		case MediaType.pdf:
			return of(() => response.blob());
		case MediaType.json:
		case MediaType.jsonld:
			return of(() => response.json());
		case MediaType.plainText:
		case MediaType.html:
		case MediaType.xml:
		case MediaType.xhtml:
		default:
			return of(() => response.text());
	}
}
