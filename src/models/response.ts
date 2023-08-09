import { Option, Range } from '../type-utils';
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

type BinaryHttpResponsePositionalProperties =
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

	/**
	 * Converts a fetch {@link Response} in a {@link HttpResponse}.
	 *
	 * @param response - a response that follows the Fetch API response schema.
	 * @returns a {@link HttpResponse} instance that translates the fetch response.
	 */
	static fromFetchResponse(response: Response): HttpResponse {
		for (const responseType of responseTypesByPriority) {
			const httpResponse = responseType.tryParseFetchResponse(response);

			if (httpResponse) {
				return httpResponse;
			}
		}

		return ServerErrorHttpResponse.tryParseFetchResponse(response);
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
	static tryParseFetchResponse(
		response: Response
	): Option<InformationalHttpResponse> {
		if (response.status >= 200) {
			return;
		}

		return new InformationalHttpResponse({
			...(extractEssential(
				response
			) as InformationalHttpResponsePositionalProperties)
		});
	}

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
	static tryParseFetchResponse(
		response: Response
	): Option<SuccessfulHttpResponse> {
		if (response.status >= 300) {
			return;
		}

		const essential = extractEssential(response);
		const responseType = this.typeOf(essential.mediaType);

		return responseType.parseFetchResponse(
			response,
			essential as Pick<
				SuccessfulHttpResponsePositionalProperties,
				'statusCode' | 'headers' | 'mediaType'
			>
		);
	}

	static parseFetchResponse(
		response: Response,
		{
			headers,
			statusCode,
			mediaType
		}: Pick<
			SuccessfulHttpResponsePositionalProperties,
			'statusCode' | 'headers' | 'mediaType'
		>
	): SuccessfulHttpResponse {
		return new SuccessfulHttpResponse({
			headers: headers,
			statusCode: statusCode,
			mediaType: mediaType,
			body: of(() => response.text())
		});
	}

	static typeOf(mediaType: MediaType): typeof SuccessfulHttpResponse {
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
				return ImageHttpResponse;
			case MediaType.binary:
			case MediaType.zip:
			case MediaType.gzip:
			case MediaType.pdf:
				return BinaryHttpResponse;
			case MediaType.json:
			case MediaType.jsonld:
				return JsonHttpResponse;
			case MediaType.plainText:
			case MediaType.html:
			case MediaType.xml:
			case MediaType.xhtml:
				return PlainTextHttpResponse;
			default:
				return SuccessfulHttpResponse;
		}
	}

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

	static tryParseFetchResponse(
		response: Response
	): Option<RedirectionHttpResponse> {
		if (response.status >= 400) {
			return;
		}

		const essential = extractEssential(response);

		return new RedirectionHttpResponse({
			...(essential as RedirectionHttpResponsePositionalProperties),
			location: new URL(essential.headers['location'])
		});
	}

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
	static tryParseFetchResponse(
		response: Response
	): Option<ClientErrorHttpResponse> {
		if (response.status >= 500) {
			return;
		}

		return new ClientErrorHttpResponse({
			...(extractEssential(
				response
			) as ClientErrorHttpResponsePositionalProperties),
			body: extractBody(response)
		});
	}

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
	static tryParseFetchResponse(response: Response): ServerErrorHttpResponse {
		return new ServerErrorHttpResponse({
			...(extractEssential(
				response
			) as ServerErrorHttpResponsePositionalProperties),
			body: extractBody(response)
		});
	}

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
 * Types a successful HTTP response which media type is {@link MediaType.json} or {@link MediaType.jsonld}.
 */
export class JsonHttpResponse extends SuccessfulHttpResponse {
	static parseFetchResponse(
		response: Response,
		{
			headers,
			statusCode,
			mediaType
		}: Pick<
			JsonHttpResponsePositionalProperties,
			'statusCode' | 'headers' | 'mediaType'
		>
	): JsonHttpResponse {
		return new JsonHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			body: of(() => response.json())
		});
	}

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
	static parseFetchResponse(
		response: Response,
		{
			headers,
			statusCode,
			mediaType
		}: Pick<
			ImageHttpResponsePositionalProperties,
			'statusCode' | 'headers' | 'mediaType'
		>
	): ImageHttpResponse {
		return new ImageHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			body: of(() => response.blob())
		});
	}

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
	static parseFetchResponse(
		response: Response,
		{
			headers,
			statusCode,
			mediaType
		}: Pick<
			PlainTextHttpResponsePositionalProperties,
			'statusCode' | 'headers' | 'mediaType'
		>
	): PlainTextHttpResponse {
		return new PlainTextHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			body: of(() => response.text())
		});
	}

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
	static parseFetchResponse(
		response: Response,
		{
			headers,
			statusCode,
			mediaType
		}: Pick<
			BinaryHttpResponsePositionalProperties,
			'statusCode' | 'headers' | 'mediaType'
		>
	): BinaryHttpResponse {
		return new BinaryHttpResponse({
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			body: of(() => response.blob())
		});
	}

	constructor({
		body,
		headers,
		mediaType,
		statusCode
	}: BinaryHttpResponsePositionalProperties) {
		super({
			body: body,
			headers: headers,
			mediaType: mediaType,
			statusCode: statusCode,
			stringify: false
		});
	}
}

const responseTypesByPriority = [
	InformationalHttpResponse,
	SuccessfulHttpResponse,
	RedirectionHttpResponse,
	ClientErrorHttpResponse,
	ServerErrorHttpResponse
];

function extractEssential(response: Response) {
	const headers = Object.fromEntries(response.headers);

	return {
		statusCode: response.status,
		headers: headers as HttpHeaders,
		mediaType: tryParseContentType(headers['content-type'])
	};
}

function extractBody(response: Response) {
	const contentType = Object.fromEntries(response.headers)['content-type'];
	const mediaType = tryParseContentType(contentType);

	const successType = SuccessfulHttpResponse.typeOf(mediaType);

	switch (successType) {
		case ImageHttpResponse:
		case BinaryHttpResponse:
			return of(() => response.blob());
		case JsonHttpResponse:
			return of(() => response.json());
		case PlainTextHttpResponse:
		default:
			return of(() => response.text());
	}
}
