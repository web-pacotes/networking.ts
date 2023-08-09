import { expect, describe, test } from '@jest/globals';
import { convert, empty, extract, of } from './body';

describe('body', function () {
	describe('empty', function () {
		test('returns a value that is null', function () {
			const body = empty();

			expect(body).toBe(null);
		});
	});

	describe('extract', function () {
		test('returns the literal body value if not a LazyHttpBody', function () {
			const body = 'value';

			const value = extract(body);

			expect(value).toBe(body);
		});

		test('computes and returns the lazy body value if a LazyHttpBody', function () {
			const body = of(() => 'value');

			const value = extract(body);

			expect(value).toBe('value');
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
