import { UrlQueryParameters } from "./params";

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
    query?: UrlQueryParameters,
): URL {
    return new URL(`${endpoint}${new URLSearchParams(query)}`, baseUrl);
}