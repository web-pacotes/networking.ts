type LazyValueCallback<T> = () => T;

/**
 * Types a value that is not computed at the time it's created.
 */
export class Lazy<T> {
	private value: T | LazyValueCallback<T>;

	protected constructor(lazy: LazyValueCallback<T>) {
		this.value = lazy;
	}

	static sync<T>(lazy: LazyValueCallback<T>) {
		return new Lazy(lazy);
	}

	static async<T>(lazy: LazyValueCallback<Promise<T>>) {
		return new AsyncLazy(lazy);
	}

	/**
	 * Gets the lazy computed value. If it's not available yet, computes it by calling the callback.
	 *
	 * @returns the lazy loaded value
	 */
	get(): T {
		if (typeof this.value === 'function') {
			this.value = (this.value as LazyValueCallback<T>)();
		}

		return this.value;
	}
}

/**
 * Types a value that is lazy loaded but requires an async call to compute it.
 */
export class AsyncLazy<T> extends Lazy<Promise<T>> {}
