import { expect, describe, test } from '@jest/globals';
import { fold, isLeft, isRight, left, right } from './either';

describe('either', function () {
	describe('isLeft', function () {
		test('returns true if monad is error', function () {
			const monad = left('error');

			const check = isLeft(monad);

			expect(check).toBeTruthy();
		});

		test('returns false if monad is success', function () {
			const monad = right('success');

			const check = isLeft(monad);

			expect(check).toBeFalsy();
		});
	});

	describe('isRight', function () {
		test('returns true if monad is success', function () {
			const monad = right('success');

			const check = isRight(monad);

			expect(check).toBeTruthy();
		});

		test('returns false if monad is error', function () {
			const monad = left('error');

			const check = isRight(monad);

			expect(check).toBeFalsy();
		});
	});

	describe('fold', function () {
		test('folds error value if monad is error', function () {
			const monad = left('error');

			const value = fold(
				monad,
				(l) => l,
				(r) => r
			);

			expect(value).toBe('error');
		});

		test('folds success value if monad is success', function () {
			const monad = right('success');

			const value = fold(
				monad,
				(l) => l,
				(r) => r
			);

			expect(value).toBe('success');
		});
	});
});
