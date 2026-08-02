import {computed, ref} from 'vue'
import {debounce} from 'quasar'
import {createSharedComposable, syncRef, tryOnScopeDispose, useCssVar, useLocalStorage} from '@vueuse/core'

function useStoredCssVar(name: string, debounceMs: number | null) {
	const
		cssVar$ = useCssVar(name, document.documentElement, {observe: true}),
		stored$ = useLocalStorage(name, cssVar$.value),
		storeDebounced = debounce((value: string | undefined) =>
			stored$.value = value,
		debounceMs ?? 0),
		model$ = ref(stored$.value),
		stops = [
			syncRef(cssVar$, stored$, {direction: 'both', transform: {rtl: value => value}}),
			syncRef(model$, stored$, {direction: 'rtl', transform: {rtl: value => value}}),
		]
	tryOnScopeDispose(() => stops.forEach(stop => stop()))
	return debounceMs === null ? stored$ : computed({
		get: () => model$.value,
		set: value => {
			model$.value = value
			storeDebounced(value)
		},
	})
}

export const useCssVarStore = createSharedComposable(() => {
	const
		cssVars = new Map<string, ReturnType<typeof useStoredCssVar>>(),

		store = {
			get(name: string, debounceMs: number | null = 100) {
				const key = JSON.stringify([name, debounceMs])
				if (!cssVars.has(key))
					cssVars.set(key, useStoredCssVar(name, debounceMs))
				return cssVars.get(key)!
			},

			set(name: string, value: string) {
				store.get(name).value = value
			},

			remove(name: string) {
				cssVars.delete(name)
				localStorage.removeItem(name)
			},
		}

	Object.values(CssVarStoreKey).forEach(key => store.get(key))
	return store
})

export enum CssVarStoreKey {
	LIGHT_BACKGROUND = '--light-background',
	LIGHT_TEXT = '--light-text',
	LIGHT_ACCENT = '--light-accent',
	DARK_BACKGROUND = '--dark-background',
	DARK_TEXT = '--dark-text',
	DARK_ACCENT = '--dark-accent',
}
