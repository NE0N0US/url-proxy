import {ref, toRef} from 'vue'
import {createSharedComposable, syncRef} from '@vueuse/core'
import {type ReqKV, Req} from '@'

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

		// #region - sync

		reqUrl$ = toRef(req$.value, 'url'),
		reqParams$ = toRef(req$.value.params, 'rows'),
		syncReq = syncRef(reqUrl$, reqParams$, {direction: 'both', transform: {
			ltr: value => {
				try {
					const url = value ? new URL(value) : null
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

			open(req?: Req) {
				if (req)
					req$.value = req
				else {
					const reqs = reqs$.value
					reqs.push(
						req$.value = Object.assign(new Req(), {
							id: Math.max(...reqs.map(({id}) => id)) + 1,
						})
					)
				}
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
							id: Math.max(...reqs.map(({id}) => id)) + 1,
							fetching: false,
						} as Req
					)
				reqs.splice(reqs.indexOf(req$.value) + 1, 0, req)
				store.open(req)
			},
		}

	return store
})
