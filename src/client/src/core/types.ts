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

export class ReqOptions {
	includeCredentials: ReqV<boolean> = {disable: false, value: false}
	followRedirects: ReqV<boolean> = {disable: false, value: false}
	integrityHashes: ReqV<string> = {disable: false, value: ''}
	curlProxy: {
		server: ReqV<string>,
	} = {
		server: {disable: true, value: ''},
	}
}
