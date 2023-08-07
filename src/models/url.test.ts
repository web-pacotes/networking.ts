import { expect, describe, test } from '@jest/globals';
import { resolveUrl, swapUrl } from './url';

describe('url', function () {
	describe('resolveUrl', function () {
		test('concats base url and endpoint with a single slash (/)', function () {
			const baseUrl = 'https://github.com';
			const endpoint = 'web-pacotes';

			const url = resolveUrl(baseUrl, endpoint).toString();
			const expectedUrl = `${baseUrl}/${endpoint}`;

			expect(url).toBe(expectedUrl);
		});

		test('concats base url and endpoint with a single slash (/), even if base url finishes with a slash', function () {
			const baseUrl = 'https://github.com';
			const endpoint = 'web-pacotes';

			const url = resolveUrl(`${baseUrl}/`, endpoint).toString();
			const expectedUrl = `${baseUrl}/${endpoint}`;

			expect(url).toBe(expectedUrl);
		});

		test('concats query parameters if present', function () {
			const baseUrl = 'https://github.com';
			const endpoint = 'web-pacotes';
			const params = { x: 'y' };

			const url = resolveUrl(`${baseUrl}/`, endpoint, params).toString();
			const expectedUrl = `${baseUrl}/${endpoint}?x=y`;

			expect(url).toBe(expectedUrl);
		});

		test('does not concat query parameters if not present', function () {
			const baseUrl = 'https://github.com';
			const endpoint = 'web-pacotes';
			const params = {};

			const url = resolveUrl(`${baseUrl}/`, endpoint, params).toString();
			const expectedUrl = `${baseUrl}/${endpoint}`;

			expect(url).toBe(expectedUrl);
		});
	});

	describe('swapUrl', function () {
		test('swaps original host', function () {
			const fullUrl = 'https://github.com/';
			const hostUrl = 'https://google.com/';

			const url = swapUrl(fullUrl, hostUrl).toString();
			const expectedUrl = 'https://google.com/';

			expect(url).toBe(expectedUrl);
		});

		test('includes original endpoint', function () {
			const fullUrl = 'https://github.com/abc';
			const hostUrl = 'https://google.com/';

			const url = swapUrl(fullUrl, hostUrl).toString();
			const expectedUrl = `https://google.com/abc`;

			expect(url).toBe(expectedUrl);
		});

		test('includes host url endpoint', function () {
			const fullUrl = 'https://github.com/abc';
			const hostUrl = 'https://google.com/def';

			const url = swapUrl(fullUrl, hostUrl).toString();
			const expectedUrl = 'https://google.com/def/abc';

			expect(url).toBe(expectedUrl);
		});
	});
});
