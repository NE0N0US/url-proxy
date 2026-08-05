/** params, headers, application/x-www-form-urlencoded */
export interface ReqKV<V = string, K = string> {
	disable: boolean
	key: K
	value: V
}

type ReqV<T> = Omit<ReqKV<T>, 'key'>

export enum ReqBodyType {
	NONE = 'none',
	TEXT = 'text',
	FILE = 'file',
	FORM_URLENCODED = 'form-urlencoded',
	FORM_MULTIPART = 'form-multipart',
}

export type ReqBody = null | string | File | ReqKV[] | ReqKV<string | File[]>[]

export enum ResBodyType {
	NONE = '',
	NULL = 'null',
	ATOB = 'atob',
	BTOA = 'btoa',
	JAVASCRIPT = 'javascript',
}

function getReqOptionsBody() {
	return {
		type: ReqBodyType.NONE,
		formTextMode: false,
		formTextValue: '',
		fileAccept: '*/*',
		value: null as ReqBody,
		pagination: {page: 1, rowsPerPage: 1},
	}
}

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
		renResHeaders: boolean,
		skipDefaults: boolean,
		method: string,
		tab: string,
		headersAll: ReturnType<typeof getReqOptionsHeadersAll>,
		body: ReturnType<typeof getReqOptionsBody>,
		resBody: string,
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
		renResHeaders: false,
		skipDefaults: false,
		tab: 'headers',
		headersAll: getReqOptionsHeadersAll(),
		body: getReqOptionsBody(),
		resBody: '',
	}
}
