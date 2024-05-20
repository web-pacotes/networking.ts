import { Interceptor } from '../interceptors';
import {
	CacheMode,
	CorsMode,
	HttpBody,
	HttpHeaders,
	HttpRequest,
	HttpRequestError,
	HttpResponse,
	MediaType,
	NoInternetConnectionError,
	TimeoutError,
	UnknownError,
	UrlQueryParameters,
	resolveUrl
} from '../models';
import { FetchClient } from '../models';
import { Either, fold, Left, Right } from '@web-pacotes/foundation-types';

/**
 * An alias for {@link NetworkingClient} positional parameters.
 */
export type NetworkingClientPositionalParameters = {
	baseUrl: URL;
	fetchClient?: FetchClient;
	timeoutMS?: number;
	interceptors?: Interceptor[];
};

/**
 * An alias for client base request positional parameters.
 */
type NetworkingClientRequestsPositionalParameters = {
	endpoint: string;
	mediaType?: MediaType;
	body?: HttpBody;
	headers?: HttpHeaders;
	query?: UrlQueryParameters;
	cache?: CacheMode;
	cors?: CorsMode;
};

// Alias for get, post, put, delete and patch methods
type NetworkingClientGetRequestPositionalParameters = Pick<
	NetworkingClientRequestsPositionalParameters,
	'endpoint' | 'headers' | 'query' | 'cache' | 'cors'
>;

type NetworkingClientPostRequestPositionalParameters = Pick<
	NetworkingClientRequestsPositionalParameters,
	'endpoint' | 'headers' | 'query' | 'body' | 'mediaType' | 'cache' | 'cors'
>;

type NetworkingClientPutRequestPositionalParameters =
	NetworkingClientPostRequestPositionalParameters;

type NetworkingClientPatchRequestPositionalParameters =
	NetworkingClientPostRequestPositionalParameters;

type NetworkingClientDeleteRequestPositionalParameters =
	NetworkingClientGetRequestPositionalParameters;

const defaultRequestsTimeoutMS = 30 * 1000;

/**
 * Types an HTTP client that uses Fetch API to perform requests. Any library that mimics fetch can be used, as
 * long as it respects the {@link FetchClient} schema.
 */
export class NetworkingClient {
	readonly baseUrl: URL;

	readonly fetchClient: FetchClient;

	readonly timeoutMS: number;

	readonly interceptors: Interceptor[];

	constructor({
		baseUrl,
		fetchClient,
		timeoutMS,
		interceptors
	}: NetworkingClientPositionalParameters) {
		this.baseUrl = baseUrl;
		this.fetchClient = fetchClient ?? fetch;
		this.timeoutMS = timeoutMS ?? defaultRequestsTimeoutMS;
		this.interceptors = interceptors ?? [];
	}

	get({
		endpoint,
		headers,
		query,
		cache,
		cors
	}: NetworkingClientGetRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'get',
				query: query,
				headers: headers,
				cache: cache,
				cors: cors
			})
		});
	}

	post({
		endpoint,
		mediaType,
		body,
		headers,
		query,
		cache,
		cors
	}: NetworkingClientPostRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'post',
				mediaType: mediaType ?? MediaType.json,
				body: body,
				query: query,
				headers: headers,
				cache: cache,
				cors: cors
			})
		});
	}

	put({
		endpoint,
		mediaType,
		body,
		headers,
		query,
		cache,
		cors
	}: NetworkingClientPutRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'put',
				mediaType: mediaType ?? MediaType.json,
				body: body,
				query: query,
				headers: headers,
				cache: cache,
				cors: cors
			})
		});
	}

	patch({
		endpoint,
		mediaType,
		body,
		headers,
		query,
		cache,
		cors
	}: NetworkingClientPatchRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'patch',
				mediaType: mediaType ?? MediaType.json,
				body: body,
				query: query,
				headers: headers,
				cache: cache,
				cors: cors
			})
		});
	}

	delete({
		endpoint,
		headers,
		query,
		cache,
		cors
	}: NetworkingClientDeleteRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'delete',
				query: query,
				headers: headers,
				cache: cache,
				cors: cors
			})
		});
	}

	async send({
		request,
		eager
	}: {
		request: HttpRequest;
		eager?: boolean;
	}): Promise<Either<HttpRequestError, HttpResponse>> {
		let result: Either<HttpRequestError, HttpResponse>;

		try {
			const mergeRequest = request.merge(
				this.interceptors.map((x) => x.onRequest(request))
			);

			const fetchRequest = mergeRequest.toFetchRequest();

			const fetchResponse = await this.fetchClient(fetchRequest, {
				signal: AbortSignal.timeout(this.timeoutMS)
			});

			if (eager ?? true) {
				result = Right(
					await HttpResponse.fromEagerFetchResponse(fetchResponse)
				);
			} else {
				result = Right(HttpResponse.fromFetchResponse(fetchResponse));
			}
		} catch (err) {
			if (err === undefined) {
				result = Left(new NoInternetConnectionError());
			} else if (!(err instanceof Error)) {
				result = Left(new UnknownError({ cause: `${err}` }));
			} else if (err.name === 'TimeoutError') {
				result = Left(
					new TimeoutError({
						cause: err.message,
						timeoutMS: this.timeoutMS
					})
				);
			} else {
				result = Left(new UnknownError({ cause: JSON.stringify(err) }));
			}
		}

		fold(
			result,
			(l) => this.interceptors.forEach((x) => x.onError(l)),
			(r) => this.interceptors.forEach((x) => x.onResponse(r))
		);

		return result;
	}
}
