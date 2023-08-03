import { expect, describe, test } from '@jest/globals';
import { convert, empty, of } from './body';

describe('body', function () {
	describe('empty', function () {
		test('returns a lazy value that resolves to null', function () {
			const body = empty();

			const computed = body.get();

			expect(computed).toBe(null);
		});
	});

	describe('convert', function () {
		test('returns null if body is null', function () {
			const data = null;
			const body = of(() => data);

			const result = convert(body);

			expect(result).toBeNull();
		});

		test('returns JSON string if body is object', function () {
			const data = { username: 'web-pacotes', repo: 'networking.ts' };
			const body = of(() => data);

			const result = convert(body);
			const expected = JSON.stringify(data);

			expect(result).toBe(expected);
		});

		test('returns JSON string if body is array', function () {
			const data = [{ username: 'web-pacotes', repo: 'networking.ts' }];
			const body = of(() => data);

			const result = convert(body);
			const expected = JSON.stringify(data);

			expect(result).toBe(expected);
		});

		test('returns unmodified string if body is string', function () {
			const data = 'https://github.com/web-pacotes/networking.ts';
			const body = of(() => data);

			const result = convert(body);
			const expected = data;

			expect(result).toBe(expected);
		});

		test('returns unmodified blob if body is binary', function () {
			const data = new Blob();
			const body = of(() => data);

			const result = convert(body);
			const expected = data;

			expect(result).toBe(expected);
		});
	});
});
