export class AppService {
	/** recursive `Object.freeze()` */
	static freeze<T extends Object>(object: T) {
		if (object === null || typeof object !== 'object')
			return object
		for (const key of Reflect.ownKeys(object))
			this.freeze(object[key as keyof object])
		return Object.freeze(object)
	}

	/** relative or protocol-less */
	static resolveUrl(url: string, base = location.toString(), protocol = 'http') {
		const isRelative = url === '.' ||
			url.startsWith('/') ||
			url.startsWith('./') ||
			url.startsWith('../') ||
			url.startsWith('?') ||
			url.startsWith('#')
		return isRelative ? new URL(url, base).href :
			url.match(/^\w+:\/\//) ? url : (protocol + '://' + url)
	}

	/** parseable http(s) */
	static isValidUrl(value: string) {
		try {
			const url = new URL(value)
			return ['http:', 'https:'].includes(url.protocol)
		}
		catch {
			return false
		}
	}
}
