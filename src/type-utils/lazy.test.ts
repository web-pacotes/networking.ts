import { expect, describe, test } from '@jest/globals';
import { Lazy } from './lazy';

describe('lazy', function () {
	describe('sync', function () {
		test('first call computes the value', function () {
			let value = 3;

			const lazyCallback = () => (value = value + 3);
			const lazy = Lazy.sync(lazyCallback);

			const computed = lazy.get();

			expect(computed).toBe(6);
		});

		test('second and subsequent calls do not compute the value', function () {
			let value = 3;

			const lazyCallback = () => (value = value + 3);
			const lazy = Lazy.sync(lazyCallback);

			for (let i = 0; i < 10; i++) {
				lazy.get();
			}

			const computed = lazy.get();

			expect(computed).toBe(6);
		});
	});

	describe('async', function () {
		test('second and subsequent calls return a resolved promise', async function () {
			let value = 3;

			const lazyCallback = async () => (value = value + 3);
			const lazy = Lazy.async(lazyCallback);

			for (let i = 0; i < 10; i++) {
				await lazy.get();
			}

			const computed = await lazy.get();

			expect(computed).toBe(6);
		});
	});
});
