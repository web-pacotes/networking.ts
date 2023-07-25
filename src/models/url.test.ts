import { expect, describe, test } from '@jest/globals';
import { resolveUrl } from './url';

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
    });
});