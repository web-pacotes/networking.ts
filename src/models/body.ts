import { AsyncLazy } from '../type-utils';

type Text = string;
type Binary = Blob;
type JSON = NonNullable<object>;
type JSONArray = Array<NonNullable<JSON | number | string | boolean>>;
type Anything<T = object | Binary | JSON | JSONArray | Text | undefined> = T;

// Declare global empty async lazy instance so it's possible to check if a body is empty
const emptyAsyncLazy = AsyncLazy.async(() => Promise.resolve(undefined));

/**
 * Types a request/response body as a {@link Buffer}.
 */
export type HttpBody<T = Anything> = AsyncLazy<T>;

/**
 * Creates a {@link HttpBody} that resolves an empty(undefined) value.
 *
 * @returns a lazy {@link HttpBody} that resolves an empty promise.
 */
export function empty(): HttpBody {
	return emptyAsyncLazy;
}

/**
 * Provides a type guard that validates if a body is empty.
 *
 * @param body - the body in validation
 * @returns true if the body is empty, false if not
 */
export function isEmpty(body: HttpBody): body is HttpBody<undefined> {
	return body === emptyAsyncLazy;
}

/**
 * Creates a {@link HttpBody} in a lazy manner.
 *
 * @returns a lazy {@link HttpBody} that does not resolve until computed.
 */
export function of<T = Anything>(value: () => Promise<T>): HttpBody<T> {
	return AsyncLazy.async(value);
}

/**
 * Converts a {@link HttpBody} in a {@link ReadableStream}, by pulling data from the computed body value.
 *
 * @param body - the body to convert
 * @returns a {@link ReadableStream} which pulls data by computing lazy body value.
 */
export function convert<T = Anything>(body: HttpBody<T>): ReadableStream<T> {
	return new ReadableStream({
		async start(controller) {
			try {
				const computed = await body.get();

				controller.enqueue(computed);
			} catch (error) {
				controller.error(error);
			}

			controller.close();
		}
	});
}
