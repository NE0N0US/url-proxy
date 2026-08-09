import {parse} from '@scrape-do/curl-parser'
import {Req, ReqBodyType, type ReqKV} from '@'

/** POSIX shell quoting */
function shellQuote(value: string) {
	return '\'' + value.replace(/'/g, '\'\\\'\'') + '\''
}

export class CurlService {
	static async toCurl(req: Req) {
		const args: string[] = ['curl']
		if (req.options.followRedirects)
			args[0] += ' -L'
		args.push('--url ' + shellQuote((await req.urlFull)!))
		args.push('-X ' + shellQuote(req.method))
		args.push(...req.headers.rows
			.filter(({disable, key}) => !disable && key)
			.map(({key, value}) => '-H ' + shellQuote(`${key}: ${value}`))
		)
		switch (req.body.type) {
			case ReqBodyType.TEXT:
			case ReqBodyType.FILE:
				const text = req.body.type === ReqBodyType.TEXT
					? req.body.value as string
					: '@' + (req.body.value as File).name
				args.push('--data-raw ' + shellQuote(text))
				if (!req.headers.rows.some(({disable, key}) =>
					!disable && key.toLowerCase() === 'content-type'
				))
					args.push('-H ' + shellQuote('Content-Type: text/plain'))
				break
			case ReqBodyType.FORM_URLENCODED:
			case ReqBodyType.FORM_MULTIPART:
				const fields = (req.body.value as ReqKV[] | ReqKV<string | File[]>[])
					.filter(({disable, key}) => !disable && key)
					.flatMap(({key, value}) => Array.isArray(value)
						? value.map(value => [key, '@' + value.name])
						: [[key, value]]
					)
				args.push(...fields.map(([key, value]) => (req.body.type === ReqBodyType.FORM_URLENCODED
					? '--data-urlencode ' : '-F ') + shellQuote(`${key}=${value}`)
				))
				break
		}
		return args.join(' \\\n\t')
	}

	static fromCurl(curl: string) {
		const
			req = new Req(),
			{flags: {location}, url, method, headers, formData, body, bodyArg} = parse(curl)
		req.options.followRedirects = location ?? false
		req.url = url ?? ''
		req.method = method.toUpperCase()
		req.headers.rows = headers.map(row => Object.assign(row, {disable: false}))
		if (formData?.length)
			Object.assign(req.body, {
				type: ReqBodyType.FORM_MULTIPART,
				value: formData.map(row => Object.assign(row, {disable: false})),
			})
		else if (body !== null && bodyArg === 'urlencode')
			Object.assign(req.body, {
				type: ReqBodyType.FORM_URLENCODED,
				value: [...new URLSearchParams(body).entries()]
					.map(([key, value]) => ({disable: false, key, value})),
			})
		else if (body !== null)
			Object.assign(req.body, {
				type: ReqBodyType.TEXT,
				value: body,
			})
		return req
	}
}
