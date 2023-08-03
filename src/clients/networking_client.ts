import {
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
import { FetchClient } from '../models/fetch';
import { Either } from '../type-utils';

/**
 * An alias for {@link NetworkingClient} positional parameters.
 */
export type NetworkingClientPositionalParameters = {
	baseUrl: URL;
	fetchClient?: FetchClient;
	timeoutMS?: number;
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
};

// Alias for get, post, put, delete and patch methods
type NetworkingClientGetRequestPositionalParameters = Pick<
	NetworkingClientRequestsPositionalParameters,
	'endpoint' | 'headers' | 'query'
>;

type NetworkingClientPostRequestPositionalParameters = Pick<
	NetworkingClientRequestsPositionalParameters,
	'endpoint' | 'headers' | 'query' | 'body' | 'mediaType'
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

	constructor({
		baseUrl,
		fetchClient,
		timeoutMS
	}: NetworkingClientPositionalParameters) {
		this.baseUrl = baseUrl;
		this.fetchClient = fetchClient ?? fetch;
		this.timeoutMS = timeoutMS ?? defaultRequestsTimeoutMS;
	}

	get({
		endpoint,
		headers,
		query
	}: NetworkingClientGetRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'get',
				query: query,
				headers: headers
			})
		});
	}

	post({
		endpoint,
		mediaType,
		body,
		headers,
		query
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
				headers: headers
			})
		});
	}

	put({
		endpoint,
		mediaType,
		body,
		headers,
		query
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
				headers: headers
			})
		});
	}

	patch({
		endpoint,
		mediaType,
		body,
		headers,
		query
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
				headers: headers
			})
		});
	}

	delete({
		endpoint,
		headers,
		query
	}: NetworkingClientDeleteRequestPositionalParameters): Promise<
		Either<HttpRequestError, HttpResponse>
	> {
		const url = resolveUrl(this.baseUrl, endpoint);

		return this.send({
			request: new HttpRequest({
				url: url,
				verb: 'delete',
				query: query,
				headers: headers
			})
		});
	}

	async send({
		request
	}: {
		request: HttpRequest;
	}): Promise<Either<HttpRequestError, HttpResponse>> {
		let result: Either<HttpRequestError, HttpResponse>;

		try {
			const fetchRequest = request.toFetchRequest();

			const fetchResponse = await this.fetchClient(fetchRequest, {
				signal: AbortSignal.timeout(this.timeoutMS)
			});

			result = HttpResponse.fromFetchResponse(fetchResponse);
		} catch (err) {
			if (err === undefined) {
				result = new NoInternetConnectionError();
			} else if (!(err instanceof Error)) {
				result = new UnknownError({ cause: `${err}` });
			} else if (err.name === 'TimeoutError') {
				result = new TimeoutError({
					cause: err.message,
					timeoutMS: this.timeoutMS
				});
			} else {
				result = new UnknownError({ cause: JSON.stringify(err) });
			}
		}

		return result;
	}
}
