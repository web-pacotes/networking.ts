import { expect, describe, test } from '@jest/globals';
import { convert, empty, of } from './body';

describe('body', function () {
	describe('empty', function () {
		test('returns a lazy value that resolves to undefined', function () {
			const body = empty();

			const computed = body.get();

			expect(computed).resolves.toBe(undefined);
		});
	});

	describe('convert', function () {
		test('returns a readable stream that pulls all data from the body', function () {
			const data = 'secret message';
			const body = of(() => Promise.resolve(data));

			const readable = convert(body);
			const result = Promise.resolve(readable.getReader().read());
			const expected = { done: false, value: data };

			expect(result).resolves.toEqual(expected);
		});
	});
});
