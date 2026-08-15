import {SearchParam} from '../../../lib/proxy/params'
import {AppService} from '@'

/** params, headers*, application/x-www-form-urlencoded, multipart/form-data */
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

function getReqKv() {
	return {
		textMode: false,
		textValue: '',
		rows: [] as ReqKV[],
		pagination: {page: 1, rowsPerPage: 1},
	}
}

function getReqBody() {
	return {
		type: ReqBodyType.NONE,
		formTextMode: false,
		formTextValue: '',
		formPagination: {page: 1, rowsPerPage: 1},
		fileAccept: '*/*',
		textLang: null as null | string,
		value: null as ReqBody,
	}
}

function getReqOptionsHeadersAll() {
	return Object.fromEntries(
		['headers', 'delHeaders', 'resHeaders', 'delResHeaders'].map(name => [name, {
			name,
			deleteMode: name.startsWith('del'),
			...getReqKv(),
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
		body: ReturnType<typeof getReqBody>,
		resBody: string,
	} = {
		server: {disable: true, value: AppService.resolveUrl('/')},
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
		body: getReqBody(),
		resBody: '',
	}
}

async function stringifyBody(type: ReqBodyType, body: ReqBody) {
	switch (type) {
		case ReqBodyType.TEXT:
			return body as string
		case ReqBodyType.FILE:
			if (body)
				return await (body as File).text()
		case ReqBodyType.FORM_URLENCODED:
		case ReqBodyType.FORM_MULTIPART:
			const fields = (body as ReqKV[] | ReqKV<string | File[]>[])
				.filter(({disable, key}) => !disable && key)
				.flatMap(({key, value}) => Array.isArray(value)
					? value.map(value => [key, value])
					: [[key, value]]
				)
			if (type === ReqBodyType.FORM_URLENCODED && fields.length)
				return new URLSearchParams(fields as string[][]).toString()
			else if (type === ReqBodyType.FORM_MULTIPART && fields.length) {
				const form = new FormData()
				fields.forEach(([key, value]) => form.append(key as string, value!))
				const
					req = new Request('', {method: 'POST', body: form}),
					buffer = await req.arrayBuffer(),
					text = new TextDecoder().decode(buffer)
				return text
			}
	}
}

async function getFullUrl(req: Req) {
	if (req.urlValid) {
		const
			url = AppService.resolveUrl(req.url),
			{
				server, urls,
				fastest, renResHeaders, skipDefaults,
				retry, retryIn, retryFactor, retryLimit,
				timeout, ttfb, throttle, throttleUp,
				status, statusText, method, resBody,
				headersAll: {headers, delHeaders, resHeaders, delResHeaders},
				body: {type: bodyType, value: body},
			} = req.options.curlProxy,
			params: [string, string][] = [[SearchParam.URL, url]]
		if (server.disable || !server.value)
			return url
		// urls
		if (!urls.disable)
			params.push(...urls.value
				.split('\n')
				.filter(line => line)
				.map(url => [SearchParam.URL, url] as [string, string])
			)
		// flags
		;[
			[SearchParam.FASTEST, fastest],
			[SearchParam.REN_RES_HEADERS, renResHeaders],
			[SearchParam.SKIP_DEFAULTS, skipDefaults],
		].forEach(([key, value]) => {
			if (value)
				params.push([key as string, ''])
		})
		// primitives
		;[
			[SearchParam.RETRY, retry],
			[SearchParam.RETRY_IN, retryIn],
			[SearchParam.RETRY_FACTOR, retryFactor],
			[SearchParam.RETRY_LIMIT, retryLimit],
			[SearchParam.TIMEOUT, timeout],
			[SearchParam.TTFB, ttfb],
			[SearchParam.THROTTLE, throttle],
			[SearchParam.THROTTLE_UP, throttleUp],
			[SearchParam.STATUS, status],
			[SearchParam.STATUS_TEXT, statusText],
			[SearchParam.METHOD, method],
			[SearchParam.RES_BODY, resBody],
		].forEach(([key, value]) => {
			if (value)
				params.push([key as string, value])
		})
		// objects
		;[
			[SearchParam.HEADERS, headers],
			[SearchParam.RES_HEADERS, resHeaders],
		].forEach(([key, value]) => {
			const entries = ((value as any).rows as ReqKV[])
				.filter(({disable, key}) => !disable && key)
				.map(({key, value}) => [key, value])
			if (entries.length)
				params.push([
					key as string,
					JSON.stringify(Object.fromEntries(entries)),
				])
		})
		// arrays
		;[
			[SearchParam.DEL_HEADERS, delHeaders],
			[SearchParam.DEL_RES_HEADERS, delResHeaders],
		].forEach(([key, value]) => {
			const keys = ((value as any).rows as ReqKV[])
				.filter(({disable, key}) => !disable && key)
				.map(({key}) => key)
			if (keys.length)
				params.push([
					key as string,
					JSON.stringify(keys),
				])
		})
		// body
		const bodyString = await stringifyBody(bodyType, body)
		if (bodyString !== undefined)
			params.push([SearchParam.BODY, bodyString])
		return server.value + '?' + params
			.map(([key, value]) => `${encodeURIComponent(key)}${value ? '=' : ''}${encodeURIComponent(value)}`)
			.join('&')
	}
	else
		return null
}

export class Req {
	id = 0
	method = 'GET'
	url = ''
	get urlValid() {
		return !!this.url && AppService.isValidUrl(AppService.resolveUrl(this.url))
	}
	get urlFull() {
		return getFullUrl(this)
	}
	tab = 'params'
	params = getReqKv()
	headers = getReqKv()
	body = getReqBody()
	options = new ReqOptions()
	fetching = false

	/** preserve tabs and paginations */
	patchView(req: Req) {
		this.tab = req.tab
		this.params.pagination = req.params.pagination
		this.headers.pagination = req.headers.pagination
		this.body.formPagination = req.body.formPagination
		this.options.curlProxy.tab = req.options.curlProxy.tab
		this.options.curlProxy.headersAll.headers!.pagination =
			req.options.curlProxy.headersAll.headers!.pagination
		this.options.curlProxy.headersAll.delHeaders!.pagination =
			req.options.curlProxy.headersAll.delHeaders!.pagination
		this.options.curlProxy.headersAll.resHeaders!.pagination =
			req.options.curlProxy.headersAll.resHeaders!.pagination
		this.options.curlProxy.headersAll.delResHeaders!.pagination =
			req.options.curlProxy.headersAll.delResHeaders!.pagination
		this.options.curlProxy.body.formPagination =
			req.options.curlProxy.body.formPagination
		return this
	}
}
