import {AppService, Req, ReqBodyType, type ReqKV, SearchParam} from '@'

export class ReqService {
	static extractCurlProxy(req: Req) {
		const
			url = new URL(AppService.resolveUrl(req.url)),
			urls = url.searchParams.getAll(SearchParam.URL)
		req.url = AppService.resolveUrl(urls[0]!, url.origin + url.pathname)
		// server
		req.options.curlProxy.server.disable = false
		req.options.curlProxy.server.value = url.origin + url.pathname
		// urls
		req.options.curlProxy.urls.disable = false
		req.options.curlProxy.urls.value = urls.slice(1).join('\n')
		// flags
		req.options.curlProxy.fastest = url.searchParams.has(SearchParam.FASTEST)
		req.options.curlProxy.renResHeaders = url.searchParams.has(SearchParam.REN_RES_HEADERS)
		req.options.curlProxy.skipDefaults = url.searchParams.has(SearchParam.SKIP_DEFAULTS)
		// primitives
		req.options.curlProxy.retry = url.searchParams.get(SearchParam.RETRY) ?? ''
		req.options.curlProxy.retryIn = url.searchParams.get(SearchParam.RETRY_IN) ?? ''
		req.options.curlProxy.retryFactor = url.searchParams.get(SearchParam.RETRY_FACTOR) ?? ''
		req.options.curlProxy.retryLimit = url.searchParams.get(SearchParam.RETRY_LIMIT) ?? ''
		req.options.curlProxy.timeout = url.searchParams.get(SearchParam.TIMEOUT) ?? ''
		req.options.curlProxy.ttfb = url.searchParams.get(SearchParam.TTFB) ?? ''
		req.options.curlProxy.throttle = url.searchParams.get(SearchParam.THROTTLE) ?? ''
		req.options.curlProxy.throttleUp = url.searchParams.get(SearchParam.THROTTLE_UP) ?? ''
		req.options.curlProxy.status = url.searchParams.get(SearchParam.STATUS) ?? ''
		req.options.curlProxy.statusText = url.searchParams.get(SearchParam.STATUS_TEXT) ?? ''
		req.options.curlProxy.method = url.searchParams.get(SearchParam.METHOD) ?? ''
		req.options.curlProxy.resBody = url.searchParams.get(SearchParam.RES_BODY) ?? ''
		// objects
		const [headers, resHeaders] = [SearchParam.HEADERS, SearchParam.RES_HEADERS]
			.map(param => Object.entries(JSON.parse(url.searchParams.get(param) ?? '{}'))
				.map(([key, value]) => ({disable: false, key, value: value?.toString() ?? ''}))
			)
		req.options.curlProxy.headersAll.headers!.rows = headers!
		req.options.curlProxy.headersAll.resHeaders!.rows = resHeaders!
		// arrays
		const [delHeaders, delResHeaders] = [SearchParam.DEL_HEADERS, SearchParam.DEL_RES_HEADERS]
			.map(param => (JSON.parse(url.searchParams.get(param) ?? '[]') as unknown[])
				.map(key => ({disable: false, key: key?.toString() ?? '', value: ''}))
			)
		req.options.curlProxy.headersAll.delHeaders!.rows = delHeaders!
		req.options.curlProxy.headersAll.delResHeaders!.rows = delResHeaders!
		// body
		req.options.curlProxy.body.type =
			url.searchParams.has(SearchParam.BODY) ? ReqBodyType.TEXT : ReqBodyType.NONE
		req.options.curlProxy.body.value = url.searchParams.get(SearchParam.BODY)
	}

	static #deserializeBody(obj: any) {
		switch (obj.bodyType) {
			case ReqBodyType.FILE:
				return new File([], obj.body)
			case ReqBodyType.FORM_MULTIPART:
				return (obj.body as ReqKV<string | string[], string>[])
					.map(row => ({
						...row,
						value: Array.isArray(row.value)
							? row.value.map(name => new File([], name)) : row.value,
					}))
			default:
				return obj.body
		}
	}

	static deserialize(obj: any) {
		const req = new Req()
		req.method = obj.method
		req.url = obj.url
		req.headers.rows = obj.headers
		req.body.type = obj.bodyType
		req.body.value = ReqService.#deserializeBody(obj)
		req.options.includeCredentials = obj.includeCredentials
		req.options.followRedirects = obj.followRedirects
		req.options.integrityHashes.disable = false
		req.options.integrityHashes.value = obj.integrityHashes
		if (obj.extractCurlProxy)
			ReqService.extractCurlProxy(req)
		return req
	}

	static #serializeBody(req: Req) {
		switch (req.body.type) {
			case ReqBodyType.FILE:
				return (req.body.value as File).name
			case ReqBodyType.FORM_MULTIPART:
				return (req.body.value as ReqKV<string | File[], string>[])
					.map(row => ({
						...row,
						value: Array.isArray(row.value)
							? row.value.map(({name}) => name) : row.value,
					}))
			default:
				return req.body.value
		}
	}

	static async serialize(req: Req) {
		return {
			method: req.method,
			url: await req.urlFull,
			headers: req.headers.rows,
			bodyType: req.body.type,
			body: ReqService.#serializeBody(req),
			includeCredentials: req.options.includeCredentials,
			followRedirects: req.options.followRedirects,
			integrityHashes: req.options.integrityHashes.disable
				? '' : req.options.integrityHashes.value,
			extractCurlProxy:
				!!req.options.curlProxy.server.value &&
				!req.options.curlProxy.server.disable,
		}
	}
}
