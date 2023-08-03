import { expect, describe, test } from '@jest/globals';
import { AuthorizationInterceptor } from './authorization_interceptor';
import { HttpRequest } from '../models';

describe('AuthorizationInterceptor', function () {
	describe('onRequest', function () {
		test('applies bearer authorization by default', function () {
			const parameters = 'mr guys';

			const interceptor = new AuthorizationInterceptor({ parameters: parameters });
			const request = new HttpRequest({ url: new URL('https://github.com/web-pacotes/networking.ts/'), verb: 'get' });

			const interceptedRequest = interceptor.onRequest(request);
			const expectedHeaders = { 'Authorization': `Bearer ${parameters}` };

			expect(interceptedRequest.headers).toStrictEqual(expectedHeaders);
		});

		test('overrides existing authorization header', function () {
			const parameters = 'mr guys';

			const interceptor = new AuthorizationInterceptor({ parameters: parameters });
			const request = new HttpRequest({
				url: new URL('https://github.com/web-pacotes/networking.ts/'), verb: 'get',
				headers: { 'Authorization': 'Bearer kawasaky' },
			});

			const interceptedRequest = interceptor.onRequest(request);
			const expectedHeaders = { 'Authorization': `Bearer ${parameters}` };

			expect(interceptedRequest.headers).toStrictEqual(expectedHeaders);
		});

		test('does not override existing non authorization headers', function () {
			const parameters = 'mr guys';

			const interceptor = new AuthorizationInterceptor({ parameters: parameters });
			const request = new HttpRequest({
				url: new URL('https://github.com/web-pacotes/networking.ts/'), verb: 'get',
				headers: { 'User-Agent': 'node' },
			});

			const interceptedRequest = interceptor.onRequest(request);
			const expectedHeaders = { 'Authorization': `Bearer ${parameters}`, 'User-Agent': 'node' };

			expect(interceptedRequest.headers).toStrictEqual(expectedHeaders);
		});
	});
});
