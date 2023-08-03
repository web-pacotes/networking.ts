import { HttpRequest } from '../models';
import { RequestInterceptor } from './interceptor';

type AuthorizationInterceptorPositionalParameters = Pick<
	AuthorizationInterceptor,
	'parameters'
> & {
	header?: string;
	scheme?: string;
};

/**
 * A {@link RequestInterceptor} that adds `Authorization` header in the request headers before sending it to the server.
 * The implementation focuses on `Basic` authorization, which consists in choosing a scheme (e.g., `Bearer`) and a token/value e.g., `my token`).
 *
 * The `header` property defaults to *Authorization*.
 */
export class AuthorizationInterceptor extends RequestInterceptor {
	header: string;

	scheme: string;

	parameters: string;

	constructor({
		header,
		scheme,
		parameters
	}: AuthorizationInterceptorPositionalParameters) {
		super();

		this.header = header ?? 'Authorization';
		this.scheme = scheme ?? 'Bearer';
		this.parameters = parameters;
	}

	onRequest(request: HttpRequest): HttpRequest {
		const headers = { ...request.headers };

		headers[this.header] = `${this.scheme} ${this.parameters}`;

		return request.copyWith({
			headers: headers
		});
	}
}
