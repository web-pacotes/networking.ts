import { HttpHeaders } from './headers';
import { MediaType } from './media_type';
import { HttpVerb } from './verb';
import { HttpBody, convert, empty } from './body';
import { UrlQueryParameters } from './params';
import { resolveUrl } from './url';
import { CacheMode } from './cache';
import { CorsMode } from './cors';

/**
 * An alias for {@link HttpRequest} positional parameters.
 */
type HttpRequestPositionalProperties = Pick<HttpRequest, 'url' | 'verb'> &
	Pick<
		Partial<HttpRequest>,
		'body' | 'headers' | 'mediaType' | 'query' | 'cache' | 'cors'
	>;

/**
 * Types an HTTP request. Only the url and verb fields are required, if others are not provided it defaults to a request with
 * empty or no body with {@link MediaType.binary} type.
 */
export class HttpRequest {
	readonly mediaType: MediaType;

	readonly headers: HttpHeaders;

	readonly query: UrlQueryParameters;

	readonly body: HttpBody;

	readonly url: URL;

	readonly verb: HttpVerb;

	readonly cache: CacheMode;

	readonly cors: CorsMode;

	constructor({
		url,
		verb,
		headers,
		query,
		mediaType,
		body,
		cache,
		cors
	}: HttpRequestPositionalProperties) {
		this.url = url;
		this.verb = verb;
		this.headers = headers ?? <HttpHeaders>{};
		this.query = query ?? <UrlQueryParameters>{};
		this.mediaType = mediaType ?? MediaType.binary;
		this.cache = cache ?? 'default';
		this.cors = cors ?? 'no-cors';
		this.body = body ?? empty();
	}

	/**
	 * Allows building a new {@link HttpRequest} with new properties. Any null property will not be assigned
	 * and instead this instance property value will be used.
	 *
	 * @param value - new properties to use on the requet.
	 * @returns a new {@link HttpRequest} instance with new data
	 */
	copyWith(value: Partial<HttpRequest>): HttpRequest {
		return new HttpRequest({
			url: value.url ?? this.url,
			verb: value.verb ?? this.verb,
			headers: value.headers ?? this.headers,
			query: value.query ?? this.query,
			mediaType: value.mediaType ?? this.mediaType,
			body: value.body ?? this.body,
			cache: value.cache ?? this.cache,
			cors: value.cors ?? this.cors
		});
	}

	/**
	 * Merges multiple {@link HttpRequest} in one single {@link HttpRequest}.
	 * Use it when you want to combine multiple request headers.
	 *
	 * @param requests - the array of requests to merge in the present reqpropertiesuest
	 * @returns a {@link HttpRequest} with all requests combined with this sinstance
	 */
	merge(requests: HttpRequest[]): HttpRequest {
		if (requests.length === 0) {
			return this;
		}

		const headers = <HttpHeaders>{
			...this.headers,
			...requests.reduce(
				(p, c) => <HttpHeaders>{ ...p, ...c.headers },
				<HttpHeaders>{}
			)
		};

		return this.copyWith({
			headers: headers
		});
	}

	/**
	 * Transforms this {@link HttpRequest} instance in a Fetch {@link Request} object.
	 *
	 * @returns a fetch request that is a translation of this instance
	 */
	toFetchRequest(): Request {
		const init = <RequestInit>{
			body: convert(this.body),
			cache: this.cache,
			mode: this.cors,
			method: this.verb,
			headers: {
				...this.headers,
				'content-type': this.mediaType
			}
		};

		let url = this.url;

		if (Object.keys(this.query).length > 0) {
			url = resolveUrl(this.url, '', this.query);
		}

		return new Request(url, init);
	}

	/**
	 * Transforms this {@link HttpRequest} instance in a *cURL* like request.
	 *
	 * @returns a string that represents the curl request.
	 */
	toCurl(): string {
		let url = this.url;

		if (Object.keys(this.query).length > 0) {
			url = resolveUrl(this.url, '', this.query);
		}

		const body = convert(this.body);

		return `curl -X ${this.verb.toUpperCase()} '${url.toString()}' ${Object.entries(
			this.headers
		).reduce((p, c) => `${p} -H '${c[0]}: ${c[1]}'`, '')} ${
			body != null ? `-H 'content-type: ${this.mediaType}' -d ${this.body}` : ''
		}`;
	}
}
