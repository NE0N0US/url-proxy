export class AppService {
	/** recursive `Object.freeze()` */
	static freeze<T extends Object>(object: T) {
		if (object === null || typeof object !== 'object')
			return object
		for (const key of Reflect.ownKeys(object))
			AppService.freeze(object[key as keyof object])
		return Object.freeze(object)
	}

	static importFiles({multiple, accept, binary}: {multiple?: boolean, accept?: string, binary?: boolean} = {}) {
		return new Promise<null | string[] | ArrayBuffer[]>((resolve, reject) => {
			const input = document.createElement('input')
			input.type = 'file'
			if (multiple !== undefined)
				input.multiple = multiple
			if (accept !== undefined)
				input.accept = accept
			input.onchange = async () => {
				try {
					const files = input.files
						? Array(input.files.length).fill(null).map((_, index) => input.files![index]!)
						: []
					if (!files.length)
						resolve(null)
					else
						resolve(binary
							? await Promise.all(files.map(file => file.arrayBuffer()))
							: await Promise.all(files.map(file => file.text()))
						)
				}
				catch (error) {
					reject(error)
				}
			}
			input.click()
		})
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
