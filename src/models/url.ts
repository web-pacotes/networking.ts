import { UrlQueryParameters } from './params';

/**
 * Resolves an URL based on a host/base url, a target endpoint and some query parameters.
 *
 * @param baseUrl - the host or base url of the resolved url (e.g., `new URL('https://google.com/')`).
 * @param endpoint - the target endpoint of the resolved url. If this endpoint ends starts with a slash (/), the
 * resolved url will be treated as absolute, replacing any existing resource on the base URL
 * (e.g., `resolveUrl(new URL('https://google.com/search'), '/api)`) => https://google.com/api).
 * @param query - the query parameters (if any) to attach in the resolved url.
 * @returns a {@link URL} that is the result of the sum of all properties described in the function.
 */
export function resolveUrl(
	baseUrl: URL | string,
	endpoint: string,
	query?: UrlQueryParameters
): URL {
	const searchParams = new URLSearchParams(query);

	return new URL(`${endpoint}${searchParams.size > 0 ? `?${searchParams}` : ''}`, baseUrl);
}

/**
 * Swaps the host/origin of two urls. 
 * 
 * @param fullUrl - The original "full" url which host is being swapped. (e.g., https://google.com/search?q=...)
 * @param hostUrl - The url which contains the host to use instead of the original host url. (e.g., https://proxy.google.com)
 * @returns an {@link URL} that reflects the swap of the host in the original full url. (e.g., https://proxy.google.com/search?q=...)
 */
export function swapUrl(
	fullUrl: URL | string,
	hostUrl: URL | string,
): URL {
	fullUrl = new URL(fullUrl);
	hostUrl = new URL(hostUrl);

	const baseUrl = hostUrl.origin;
	const endpoint = `${hostUrl.pathname}${fullUrl.pathname}${fullUrl.search}`.replace('//', '/');

	return resolveUrl(baseUrl, endpoint);
}