import { expect, describe, test } from '@jest/globals';
import { HttpRequest } from './request';
import { of } from './body';

describe('request', function () {
	describe('toFetchRequest', function () {
		test('sets fetch request body null if request body is empty', function () {
			const request = new HttpRequest({
				url: new URL('https://github.com/web-pacote/networking'),
				verb: 'get',
			});

			const fetchRequest = request.toFetchRequest();

			expect(fetchRequest.body).toBeNull();
		});

		test('sets fetch request body as ReadableStream if request body is not empty', function () {
			const request = new HttpRequest({
				url: new URL('https://github.com/web-pacote/networking'),
				verb: 'post',
				body: of(() => 'hello world!')
			});

			const fetchRequest = request.toFetchRequest();

			expect(fetchRequest.body).toBeInstanceOf(ReadableStream<Uint8Array>);
		});

		test('includes query parameters if not empty', function () {
			const request = new HttpRequest({
				url: new URL('https://github.com/web-pacote/networking'),
				verb: 'post',
				body: of(() => 'hello world!'),
				query: { 'foo': 'bar' },
			});

			const fetchRequest = request.toFetchRequest();

			expect(fetchRequest.url).toContain('foo=bar');
		});
	});
});
