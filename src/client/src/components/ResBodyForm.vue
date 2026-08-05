<template>
<div class="artisan-req-body-form column no-wrap">
	<div class="q-px-md q-py-xs column">
		<q-option-group
			class="non-selectable"
			inline
			v-model="option$"
			:options="options"
			color="text"
		/>
	</div>
	<template v-if="option$ === ResBodyType.JAVASCRIPT">
		<q-separator/>
		<q-input
			class="grow q-px-md q-py-xs shadow-text-always"
			spellcheck="false" autocomplete="off"
			:shadow-text="javascript$ ? ' ' : 'Input JavaScript function body'"
			autogrow
			v-model="<string>javascript$"
			borderless hide-bottom-space dense
			input-class="artisan-mono"
		/>
	</template>
</div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {ResBodyType} from '@'

const
	value$ = defineModel<string>({required: true}),

	option$ = computed({
		get: () => {
			const value = value$.value
			return value.startsWith(ResBodyType.JAVASCRIPT + ':') ? ResBodyType.JAVASCRIPT : value
		},
		set: value => value$.value =
			value === ResBodyType.JAVASCRIPT ? (ResBodyType.JAVASCRIPT + ':') : value,
	}),

	javascript$ = computed({
		get: () => {
			const value = value$.value
			return value.startsWith(ResBodyType.JAVASCRIPT + ':')
				? value.slice(ResBodyType.JAVASCRIPT.length + 1) : ''
		},
		set: value => value$.value = ResBodyType.JAVASCRIPT + ':' + value,
	}),

	options = [
		{label: 'None', value: ResBodyType.NONE},
		{label: 'Remove', value: ResBodyType.NULL},
		{label: 'Decode Base64', value: ResBodyType.ATOB},
		{label: 'Encode Base64', value: ResBodyType.BTOA},
		{label: 'Custom Handler', value: ResBodyType.JAVASCRIPT},
	]
</script>
