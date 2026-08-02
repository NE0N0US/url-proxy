import {computed, ref} from 'vue'
import {useLocalStorage} from '@vueuse/core'
import {AppService, ReqBodyType, type ReqBody, type ReqKV, ReqOptions} from '@'

export class AppState {
	// #region - request method and url

	static readonly reqMethod$ = ref('GET')

	static readonly #reqUrl$ = ref('')
	static readonly reqUrl$ = computed({
		get: () => this.#reqUrl$.value,
		set: value => {
			this.#reqUrl$.value = value
			try {
				const url = value ? new URL(value) : null
				this.#reqParams$.value = this.#syncReqParams(this.#reqParams$.value,
					url?.searchParams ?? new URLSearchParams()
				)
			}
			catch {}
		},
	})
	static readonly reqUrlValid$ = computed(() => !!this.#reqUrl$.value &&
		AppService.isValidUrl(AppService.resolveUrl(this.#reqUrl$.value))
	)

	// #endregion

	// #region - request params

	static readonly #reqParams$ = ref<ReqKV[]>([])
	static readonly reqParams$ = computed({
		get: () => this.#reqParams$.value,
		set: value => {
			this.#reqParams$.value = value
			try {
				const
					search = '?' + value
						.filter(({disable, key}) => !disable && key)
						.map(({key, value}) => `${
							encodeURIComponent(key.toWellFormed())
						}${value ? '=' : ''}${
							encodeURIComponent(value.toWellFormed())
						}`)
						.join('&'),
					reqUrl = this.#reqUrl$.value
				this.#reqUrl$.value = reqUrl.split('?')[0] + (search === '?' ? '' : search)
			}
			catch {}
		},
	})

	static #syncReqParams(params: ReqKV[], reqParams: URLSearchParams) {
		const
			indices = new Set<number>(),
			newParams: ReqKV[] = params.map(param => ({...param}))
		reqParams.forEach((value, key) => {
			let index = newParams.findIndex((param, index) =>
				!param.disable && param.key && param.key === key && !indices.has(index)
			)
			if (index === -1)
				index = newParams.push({disable: false, key, value}) - 1
			else
				newParams[index]!.value = value
			indices.add(index)
		})
		return newParams.filter((param, index) => param.disable || !param.key || indices.has(index))
	}

	// #endregion

	// #region - request other data

	static readonly reqHeaders$ = ref<ReqKV[]>([])

	static readonly reqBodyType$ = ref<ReqBodyType>(ReqBodyType.NONE)
	static readonly reqBody$ = ref<ReqBody>(null)

	static readonly reqOptions$ = ref<ReqOptions>(new ReqOptions())

	// #endregion

	static readonly fetching$ = ref(false)

	static readonly ripple$ = ref<boolean | Object | undefined>(
		Object.freeze({early: true, center: false})
	)

	static readonly colorScheme$ = useLocalStorage('color-scheme', 'auto')
}
