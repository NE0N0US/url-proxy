import {computed, ref, watch} from 'vue'
import {createSharedComposable, syncRef} from '@vueuse/core'
import {AppService, type ReqKV, Req} from '@'

function syncReqParams(params: ReqKV[], reqParams: URLSearchParams) {
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

export const useReqStore = createSharedComposable(() => {
	const
		req$ = ref(new Req()),
		reqs$ = ref([req$.value]),

		touched$ = ref(false),
		watcherTouched = watch(req$, () => touched$.value = true, {deep: true}),

		// #region - sync

		reqUrl$ = computed({
			get: () => req$.value.url,
			set: value => req$.value.url = value,
		}),
		reqParams$ = computed({
			get: () => req$.value.params.rows,
			set: value => req$.value.params.rows = value,
		}),
		syncReq = syncRef(reqUrl$, reqParams$, {direction: 'both', transform: {
			ltr: value => {
				try {
					const url = value ? new URL(AppService.resolveUrl(value)) : null
					return syncReqParams(reqParams$.value,
						url?.searchParams ?? new URLSearchParams()
					)
				}
				catch {
					return reqParams$.value
				}
			},
			rtl: value => {
				try {
					const search = '?' + value
						.filter(({disable, key}) => !disable && key)
						.map(({key, value}) => `${
							encodeURIComponent(key.toWellFormed())
						}${value ? '=' : ''}${
							encodeURIComponent(value.toWellFormed())
						}`)
						.join('&')
					return reqUrl$.value.split('?')[0] + (search === '?' ? '' : search)
				}
				catch (error) {
					return reqUrl$.value
				}
			},
		}}),

		// #endregion

		store = {
			req$,
			reqs$,
			touched$,

			open(req?: Req) {
				const oldReq = req$.value
				if (req)
					req$.value = req
				else {
					const reqs = reqs$.value
					reqs.push(
						req$.value = req = Object.assign(new Req(), {
							id: Math.max(-1, ...reqs.map(({id}) => id)) + 1,
						})
					)
				}
				req.patchView(oldReq)
			},

			close() {
				const
					reqs = reqs$.value,
					index = reqs.indexOf(req$.value)
				reqs.splice(index, 1)
				store.open(reqs[Math.min(index, reqs.length - 1)])
			},

			duplicate() {
				const
					reqs = reqs$.value,
					req = Object.assign(
						new Req(),
						JSON.parse(JSON.stringify(req$.value)),
						{
							id: Math.max(-1, ...reqs.map(({id}) => id)) + 1,
							fetching: false,
						} as Req
					)
				reqs.splice(reqs.indexOf(req$.value) + 1, 0, req)
				store.open(req)
			},

			closeAll(keepOpen?: boolean) {
				reqs$.value.splice(0, Infinity, ...keepOpen ? [req$.value] : [])
				if (!keepOpen)
					store.open()
			},
		}

	return store
})
