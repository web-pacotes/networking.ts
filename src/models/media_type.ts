/**
 * All possible media/content types the library recognizes.
 */
export type MediaType =
	| 'image/avif'
	| 'application/octet-stream'
	| 'image/bmp'
	| 'multipart/form-data'
	| 'image/gif'
	| 'application/gzip'
	| 'text/html'
	| 'image/vnd.microsoft.icon'
	| 'image/jpeg'
	| 'text/javascript'
	| 'application/json'
	| 'application/ld+json'
	| 'application/pdf'
	| 'text/plain'
	| 'image/png'
	| 'image/svg+xml'
	| 'image/tiff'
	| 'image/webp'
	| 'application/xhtml+xml'
	| 'application/xml'
	| 'application/zip'
	| 'application/x-www-form-urlencoded'
	| string & NonNullable<unknown>
