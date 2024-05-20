import { HttpRequest, HttpRequestError, HttpResponse } from '../models';
import type { Either } from '@web-pacotes/foundation-types';
import {
	NetworkingClient,
	NetworkingClientPositionalParameters
} from './networking_client';

/**
 * Types the needed properties to configure a client that proxies an HTTP request at the API level.
 */
export type ProxyNetworkingClientPositionalProperties = {
	configuration: ProxyConfiguration;
} & Pick<
	NetworkingClientPositionalParameters,
	'fetchClient' | 'timeoutMS' | 'interceptors'
>;

export type ProxyConfigurationPositionalProperties = Pick<
	ProxyConfiguration,
	'url' | 'client' | 'onSend'
>;

/**
 * A {@link NetworkingClient} that proxies HTTP requests at the API level. The proxy
 * configuration is done via the {@link ProxyConfiguration} type and an example on how it can be configured
 * can be seen in {@link RelayProxyNetworkingClient}.
 */
export class ProxyNetworkingClient extends NetworkingClient {
	private readonly configuration: ProxyConfiguration;

	constructor({
		configuration,
		fetchClient,
		timeoutMS,
		interceptors
	}: ProxyNetworkingClientPositionalProperties) {
		super({
			baseUrl: configuration.url,
			fetchClient: fetchClient,
			timeoutMS: timeoutMS,
			interceptors: interceptors
		});

		this.configuration = configuration;
	}

	send({
		request
	}: {
		request: HttpRequest;
	}): Promise<Either<HttpRequestError, HttpResponse>> {
		const proxyRequest = this.configuration.onSend(request);

		return this.configuration.client.send({ request: proxyRequest });
	}
}

type OnProxyNetworkingClientSendCallback = (
	request: HttpRequest
) => HttpRequest;

/**
 * Types the needed details to configure a proxied request at the API level.
 */
export class ProxyConfiguration {
	/**
	 * The final URL that will be used to contact the proxy API/server
	 */
	url: URL;

	/**
	 * The networking client being proxied
	 */
	client: NetworkingClient;

	/**
	 * A request interceptor like callback that is used to compute the proxied request before sending it to the proxy API/server
	 */
	onSend: OnProxyNetworkingClientSendCallback;
	constructor({ url, client, onSend }: ProxyConfigurationPositionalProperties) {
		this.url = url;
		this.client = client;
		this.onSend = onSend;
	}
}
