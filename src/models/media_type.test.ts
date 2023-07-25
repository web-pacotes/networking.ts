import { expect, describe, test } from '@jest/globals';
import { MediaType, tryParseContentType } from './media_type';

describe('media type', function () {
    describe('tryParseContentType', function () {
        test('returns matched media type if input is recognized', function () {
            const type = 'image/jpeg';

            const mediaType = tryParseContentType(type);
            const expectedMediaType = MediaType.jpeg;

            expect(mediaType).toBe(expectedMediaType);
        });

        test('returns matched media type if input is recognized, even if it contains additional data', function () {
            const type = 'text/html, charset=utf-8';

            const mediaType = tryParseContentType(type);
            const expectedMediaType = MediaType.html;

            expect(mediaType).toBe(expectedMediaType);
        });

        test('returns binary if input is not recognized', function () {
            const type = 'unsupported';

            const mediaType = tryParseContentType(type);
            const expectedMediaType = MediaType.binary;

            expect(mediaType).toBe(expectedMediaType);
        });

        test('returns binary if input is null', function () {
            const type = null;

            const mediaType = tryParseContentType(type);
            const expectedMediaType = MediaType.binary;

            expect(mediaType).toBe(expectedMediaType);
        });
    });
});