/**
 * All possible media/content types the library recognizes.
 */
export enum MediaType {
	avif = 'image/avif',
	binary = 'application/octet-stream',
	bmp = 'image/bmp',
	formData = 'multipart/form-data',
	gif = 'image/gif',
	gzip = 'application/gzip',
	html = 'text/html',
	ico = 'image/vnd.microsoft.icon',
	jpeg = 'image/jpeg',
	js = 'text/javascript',
	json = 'application/json',
	jsonld = 'application/ld+json',
	pdf = 'application/pdf',
	plainText = 'text/plain',
	png = 'image/png',
	svg = 'image/svg+xml',
	tiff = 'image/tiff',
	webp = 'image/webp',
	xhtml = 'application/xhtml+xml',
	xml = 'application/xml',
	zip = 'application/zip'
}

/**
 * Attempts to parse the content-type of a HTTP response in a {@link MediaType}. If parse was not 
 * sucessful, defaults to {@link MediaType.binary}.
 * 
 * @param type - the parsing header `Content-Type` value.
 * @returns the {@link MediaType} value that matches the input type.
 */
export function tryParseContentType(type: string | null) {
	return Object.values(MediaType).find((ct) => type?.startsWith(ct)) ?? MediaType.binary;
}