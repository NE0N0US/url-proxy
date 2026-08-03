/** params, headers, application/x-www-form-urlencoded */
export interface ReqKV<V = string, K = string> {
	disable: boolean
	key: K
	value: V
}

export enum ReqBodyType {
	NONE = 'none',
	TEXT = 'text',
	FILE = 'file',
	FORM_URLENCODED = 'form-urlencoded',
	FORM_MULTIPART = 'form-multipart',
}

export type ReqBody = null | string | File | ReqKV[] | ReqKV<string | File[]>[]

type ReqV<T> = Omit<ReqKV<T>, 'key'>

function getReqOptionsHeadersAll() {
	return Object.fromEntries(
		['headers', 'delHeaders', 'resHeaders', 'delResHeaders'].map(name => [name, {
			name,
			deleteMode: name.startsWith('del'),
			textMode: false,
			textValue: '',
			rows: [],
			pagination: {page: 1, rowsPerPage: 1},
		}])
	)
}

export class ReqOptions {
	includeCredentials = false
	followRedirects = false
	integrityHashes: ReqV<string> = {disable: false, value: ''}
	curlProxy: {
		server: ReqV<string>,
		urls: ReqV<string>,
		fastest: boolean,
		retry: string,
		retryIn: string,
		retryFactor: string,
		retryLimit: string,
		timeout: string,
		ttfb: string,
		throttle: string,
		throttleUp: string,
		status: string,
		statusText: string,
		renameResponseHeaders: boolean,
		skipDefaults: boolean,
		method: string,
		headersTab: string,
		headersAll: ReturnType<typeof getReqOptionsHeadersAll>,
	} = {
		server: {disable: true, value: ''},
		urls: {disable: false, value: ''},
		fastest: false,
		method: '',
		status: '',
		statusText: '',
		retry: '',
		retryIn: '',
		retryFactor: '',
		retryLimit: '',
		timeout: '',
		ttfb: '',
		throttle: '',
		throttleUp: '',
		renameResponseHeaders: false,
		skipDefaults: false,
		headersTab: 'headers',
		headersAll: getReqOptionsHeadersAll(),
	}
}
