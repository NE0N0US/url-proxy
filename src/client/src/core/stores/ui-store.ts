import {ref} from 'vue'
import {createSharedComposable, useLocalStorage} from '@vueuse/core'

export const useUiStore = createSharedComposable(() => {
	const store = {
		ripple$: ref<boolean | Object | undefined>(
			Object.freeze({early: true, center: false})
		),

		colorScheme$: useLocalStorage('color-scheme', 'auto'),
	}
	return store
})
