/**
 * Models everything a fetch function should receive and output.
 */
export type FetchClient = (
	input: RequestInfo | URL,
	init?: RequestInit
) => Promise<Response>;
