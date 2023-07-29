import { AsyncLazy } from '../type-utils';

type Text = string;
type Binary = Blob;
type JSON = NonNullable<object>;
type JSONArray = Array<NonNullable<JSON | number | string | boolean>>;
type Anything<T = object | Binary | JSON | JSONArray | Text | undefined> = T;

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
	return AsyncLazy.async(() => Promise.resolve(undefined));
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

// export function fromReadableStream(stream: ReadableStream<Uint8Array>): HttpBody {
//     return AsyncLazy.async(
//         async function () {
//             const reader = stream.getReader();
//             const chunks = new Array<Uint8Array>();

//             for (; ;) {
//                 const { value, done } = await reader.read();

//                 if (value) {
//                     chunks.push(value);
//                 }

//                 if (done) {
//                     break;
//                 }
//             }

//             return Buffer.concat(chunks);
//         });
// }
