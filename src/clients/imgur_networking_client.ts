import { AuthorizationInterceptor } from '../interceptors';
import { resolveUrl } from '../models';
import {
	NetworkingClient,
	NetworkingClientPositionalParameters
} from './networking_client';

/**
 * Types the needed properties to configure a client to consume Imgur HTTP API.
 */
type ImgurNetworkingClientNetworkingClientPositionalProperties = {
	clientId: string;
	apiVersion: '1' | '2' | '3';
} & Pick<
	NetworkingClientPositionalParameters,
	'fetchClient' | 'timeoutMS' | 'interceptors'
>;

/**
 * A {@link NetworkingClient} that targets Imgur HTTP API.
 */
export class ImgurNetworkingClient extends NetworkingClient {
	constructor({
		clientId,
		apiVersion,
		interceptors,
		fetchClient,
		timeoutMS
	}: ImgurNetworkingClientNetworkingClientPositionalProperties) {
		super({
			baseUrl: resolveUrl('https://api.imgur.com/', apiVersion),
			fetchClient: fetchClient,
			timeoutMS: timeoutMS,
			interceptors: [
				...(interceptors ?? []),
				new ImgurApiAuthorizationInterceptor(clientId)
			]
		});
	}

	/**
	 * Creates a networking client that targets Imgur `v3` HTTP API
	 *
	 * @param clientId - the identifier that authenticates and authorizes a registered API account in Imgur
	 * @returns the client ready to consume imgur http api
	 */
	static v3(clientId: string): ImgurNetworkingClient {
		return new ImgurNetworkingClient({
			apiVersion: '3',
			clientId: clientId
		});
	}
}

/**
 * An authorization interceptor for Imgur API
 */
class ImgurApiAuthorizationInterceptor extends AuthorizationInterceptor {
	constructor(clientId: string) {
		super({
			scheme: 'Client-ID',
			parameters: clientId
		});
	}
}
