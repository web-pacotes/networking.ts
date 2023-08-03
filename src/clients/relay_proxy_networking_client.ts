import { ProxyNetworkingClient } from './proxy_networking_client';
import { ProxyNetworkingClientPositionalProperties } from './proxy_networking_client';
import {
	ProxyConfiguration,
	ProxyConfigurationPositionalProperties
} from './proxy_networking_client';

/**
 * Types the needed properties to configure a client that proxies an HTTP request using Relay Proxy API.
 */
type RelayProxyNetworkingClientPositionalProperties = {
	configuration: RelayProxyConfiguration;
} & ProxyNetworkingClientPositionalProperties;

type RelayProxyConfigurationPositionalProperties =
	ProxyConfigurationPositionalProperties & {
		bypassBodyDelete: boolean;
		bypassExposeHeaders: boolean;
	};

/**
 * A {@link ProxyNetworkingClient} that proxies HTTP requests using [Relay Proxy API](https://github.com/freitzzz/relay-worker).
 */
export class RelayProxyNetworkingClient extends ProxyNetworkingClient {
	constructor({
		configuration,
		fetchClient,
		timeoutMS,
		interceptors
	}: RelayProxyNetworkingClientPositionalProperties) {
		super({
			configuration: configuration,
			fetchClient: fetchClient,
			timeoutMS: timeoutMS,
			interceptors: interceptors
		});
	}
}

/**
 * Types the needed details to configure a proxied request using Relay Proxy API.
 */
export class RelayProxyConfiguration extends ProxyConfiguration {
	constructor({
		url,
		client,
		bypassBodyDelete,
		bypassExposeHeaders
	}: RelayProxyConfigurationPositionalProperties) {
		super({
			client: client,
			url: url,
			onSend: (request) => {
				const fetchRequest = request.toFetchRequest();

				return request.copyWith({
					url: url,
					headers: {
						...request.headers,
						'x-relay-url': fetchRequest.url,
						'x-include-body': `${bypassBodyDelete}`,
						'x-bypass-expose-headers': `${bypassExposeHeaders}`
					}
				});
			}
		});
	}
}
