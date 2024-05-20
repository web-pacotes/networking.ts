import { expect, describe, test } from '@jest/globals';
import {
	HttpResponse,
	isBinaryResponse,
	isClientErrorResponse,
	isImageResponse,
	isInformationResponse,
	isJsonResponse,
	isPlainTextResponse,
	isRedirectionResponse,
	isServerErrorResponse,
	isSuccessfulResponse
} from './response';
import { MediaType } from './media_type';

describe('response', function () {
	describe('predicates', function () {
		describe('type guards', function () {
			describe('isInformationResponse', function () {
				test('returns true if argument is instance of InformationHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 100,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isInformationResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument is not instance of InformationHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 200,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isInformationResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isSuccessfulResponse', function () {
				test('returns true if argument is instance of SuccessfulHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 200,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isSuccessfulResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument is not instance of SuccessfulHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 100,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isSuccessfulResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isRedirectionResponse', function () {
				test('returns true if argument is instance of RedirectionHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 300,
						headers: new Headers({
							location: 'https://github.com/web-pacotes/networking.ts/'
						})
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isRedirectionResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument is not instance of RedirectionHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 100,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isRedirectionResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isClientErrorResponse', function () {
				test('returns true if argument is instance of ClientErrorHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 400,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isClientErrorResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument is not instance of ClientErrorHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 100,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isClientErrorResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isServerErrorResponse', function () {
				test('returns true if argument is instance of ServerErrorHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 500,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isServerErrorResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument is not instance of ServerErrorHttpResponse', function () {
					const fetchResponse = <Response>{
						status: 100,
						headers: new Headers()
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isServerErrorResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isBinaryResponse', function () {
				test('returns true if argument media type is binary', function () {
					const fetchResponse = <Response>{
						status: 200,
						headers: new Headers({ 'content-type': 'application/gzip' })
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isBinaryResponse(httpResponse);

					expect(predicate).toBeTruthy();
				});

				test('returns false if argument media type is not binary', function () {
					const fetchResponse = <Response>{
						status: 200,
						headers: new Headers({ 'content-type': 'application/json' })
					};

					const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
					const predicate = isBinaryResponse(httpResponse);

					expect(predicate).toBeFalsy();
				});
			});

			describe('isImageResponse', function () {
				test('returns true if argument media type starts with "image"', function () {
					const mediaTypes = [
						'image/avif',
						'image/bmp',
						'image/gif',
						'image/jpeg',
						'image/png',
						'image/svg+xml',
						'image/tiff',
						'image/vnd.microsoft.icon',
						'image/webp'
					] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isImageResponse(httpResponse);

						expect(predicate).toBeTruthy();
					}
				});

				test('returns false if argument media type does not start with "image"', function () {
					const mediaTypes = [
						'application/gzip',
						'text/html'
					] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isImageResponse(httpResponse);

						expect(predicate).toBeFalsy();
					}
				});
			});

			describe('isJsonResponse', function () {
				test('returns true if argument media type ends with "json"', function () {
					const mediaTypes = [
						'application/json',
						'application/ld+json'
					] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isJsonResponse(httpResponse);

						expect(predicate).toBeTruthy();
					}
				});

				test('returns false if argument media type does not end with "json"', function () {
					const mediaTypes = ['text/javascript'] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isJsonResponse(httpResponse);

						expect(predicate).toBeFalsy();
					}
				});
			});

			describe('isPlainTextResponse', function () {
				test('returns true if argument media type is either plain text, javascript, xml or html variant', function () {
					const mediaTypes = [
						'text/plain',
						'text/javascript',
						'application/xml',
						'text/html',
						'application/xhtml+xml'
					] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isPlainTextResponse(httpResponse);

						expect(predicate).toBeTruthy();
					}
				});

				test('returns false if argument media type is not either plain text, javascript, xml or html variant', function () {
					const mediaTypes = [
						'image/avif',
						'application/pdf'
					] satisfies MediaType[];

					for (const value of mediaTypes) {
						const fetchResponse = <Response>{
							status: 200,
							headers: new Headers({ 'content-type': value })
						};

						const httpResponse = HttpResponse.fromFetchResponse(fetchResponse);
						const predicate = isPlainTextResponse(httpResponse);

						expect(predicate).toBeFalsy();
					}
				});
			});
		});

		describe('ok', function () {
			test('returns true response is either of type informational, successful or redirection', function () {
				const responses = [100, 200, 300].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers({
							location: 'https://github.com/web-pacotes/networking.ts/'
						})
					})
				);

				for (const value of responses) {
					const predicate = value.ok();

					expect(predicate).toBeTruthy();
				}
			});

			test('returns false response is not either of type informational, successful or redirection', function () {
				const responses = [400, 500].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers({
							location: 'https://github.com/web-pacotes/networking.ts/'
						})
					})
				);

				for (const value of responses) {
					const predicate = value.ok();

					expect(predicate).toBeFalsy();
				}
			});
		});

		describe('not ok', function () {
			test('returns true response is either of type client error, or server error', function () {
				const responses = [400, 500].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers()
					})
				);

				for (const value of responses) {
					const predicate = value.notOk();

					expect(predicate).toBeTruthy();
				}
			});

			test('returns false response is not either of type client error, or server error', function () {
				const responses = [100, 200, 300].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers({
							location: 'https://github.com/web-pacotes/networking.ts/'
						})
					})
				);

				for (const value of responses) {
					const predicate = value.notOk();

					expect(predicate).toBeFalsy();
				}
			});
		});

		describe('redirection', function () {
			test('returns true response is of type redirection', function () {
				const responses = [300].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers({
							location: 'https://github.com/web-pacotes/networking.ts/'
						})
					})
				);

				for (const value of responses) {
					const predicate = value.redirection();

					expect(predicate).toBeTruthy();
				}
			});

			test('returns false response is not of type redirection', function () {
				const responses = [100, 200, 400, 500].map((sc) =>
					HttpResponse.fromFetchResponse(<Response>{
						status: sc,
						headers: new Headers()
					})
				);

				for (const value of responses) {
					const predicate = value.redirection();

					expect(predicate).toBeFalsy();
				}
			});
		});
	});
});
