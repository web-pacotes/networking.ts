import { Lazy } from '../type-utils';

type Text = string;
type Binary = Blob;
type JSON = NonNullable<object>;
type JSONArray = Array<NonNullable<JSON | number | string | boolean>>;
type Anything<T = object | Binary | JSON | JSONArray | Text | null> = T;
type FetchBody = XMLHttpRequestBodyInit | null;

/**
 * Types a request/response body as a {Buffer@link Lazy<Anything>}.
 */
export type HttpBody<T = Anything> = Lazy<T>;

/**
 * Creates a {@link HttpBody} that resolves an empty(null) value.
 *
 * @returns a lazy {@link HttpBody} that resolves a null value.
 */
export function empty(): HttpBody {
	return of(() => null);
}

/**
 * Creates a {@link HttpBody} in a lazy manner.
 *
 * @returns a lazy {@link HttpBody} that does not resolve until computed.
 */
export function of<T = Anything>(value: () => T): HttpBody<T> {
	return Lazy.sync(value);
}

/**
 * Converts a {@link HttpBody} in a {@link FetchBody}.
 *
 * @param body - the body to convert
 * @returns a type of {@link FetchBody} that translates {@link HttpBody}.
 */
export function convert<T = Anything>(body: HttpBody<T>): FetchBody {
	const data = body.get();

	if (!data) {
		return null;
	} else if (isBinary(data) || !isJSON(data)) {
		return data;
	} else {
		return JSON.stringify(data);
	}
}

function isBinary(data: Anything): data is Blob {
	return data instanceof Blob;
}

function isJSON(data: Anything): data is JSON {
	return typeof data === 'object';
}
