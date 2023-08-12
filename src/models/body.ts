import { Lazy } from '../type-utils';

export type Text = string;
export type Binary = Blob;
export type JSON = NonNullable<object>;
export type JSONArray = Array<NonNullable<JSON | number | string | boolean>>;
export type Anything<T = object | Binary | JSON | JSONArray | Text | null> = T;
type FetchBody = XMLHttpRequestBodyInit | null;

/**
 * Types a request/response body as a {@link Lazy<Anything>} instance or {@link Anything} value.
 */
export type HttpBody<T = Anything> = T | LazyHttpBody<T>;
type LazyHttpBody<T = Anything> = Lazy<T>;

/**
 * Creates a {@link HttpBody} that resolves an empty(null) value.
 *
 * @returns a {@link HttpBody} that resolves a null value.
 */
export function empty(): HttpBody<null> {
	return null;
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
 * Extracts the value of a {@link HttpBody} type.
 *
 * @param body - the body which value will be extracted
 * @returns a value of {@link T} type, extracted from the {@link HttpBody} type.
 */
export function extract<T = Anything>(body: HttpBody<T>): T {
	if (isLazyBody(body)) {
		return body.get();
	}

	return body;
}

/**
 * Converts a {@link HttpBody} in a {@link FetchBody}.
 *
 * @param body - the body to convert
 * @returns a type of {@link FetchBody} that translates {@link HttpBody}.
 */
export function convert<T = Anything>(body: HttpBody<T>): FetchBody {
	const data = extract(body);

	if (!data) {
		return null;
	} else if (isBinary(data) || !isJSON(data)) {
		return data;
	} else {
		return JSON.stringify(data);
	}
}

function isLazyBody<T = Anything>(body: HttpBody<T>): body is LazyHttpBody<T> {
	return body instanceof Lazy;
}

function isBinary(data: Anything): data is Blob {
	return data instanceof Blob;
}

function isJSON(data: Anything): data is JSON {
	return typeof data === 'object';
}
