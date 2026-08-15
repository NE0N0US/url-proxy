<template>
<div class="artisan-code-editor grow column no-wrap">
	<div v-if="!noLangOptions" class="q-px-md q-py-xs column">
		<q-option-group
			class="non-selectable"
			inline
			v-model="lang$"
			:options="langs"
			color="text"
		/>
	</div>
	<codemirror
		v-model="value$"
		:disabled="disabled"
		:tab-size="tabSize ?? 4"
		:placeholder="placeholder!"
		:extensions="(lang$ !== null && lang$ in langExtensions) ? [langExtensions[lang$]] : []"
	/>
</div>
</template>

<style scoped lang="scss">
.v-codemirror :deep(.cm-editor) {
	flex-grow: 1;
}
</style>

<script setup lang="ts">
import {Codemirror} from 'vue-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {json} from '@codemirror/lang-json'
import {html} from '@codemirror/lang-html'
import {xml} from '@codemirror/lang-xml'

const
	$props = defineProps<{
		noLangOptions?: boolean | undefined,
		disabled?: boolean | undefined,
		tabSize?: number | undefined,
		placeholder?: string | undefined,
	}>(),

	langs = [
		{label: 'Plain Text', value: null},
		{label: 'JavaScript', value: 'javascript'},
		{label: 'JSON', value: 'json'},
		{label: 'HTML', value: 'html'},
		{label: 'XML', value: 'xml'},
	],

	langExtensions = {
		javascript: javascript(),
		json: json(),
		html: html(),
		xml: xml(),
	},

	lang$ = defineModel<null | keyof typeof langExtensions>('lang', {required: true}),

	value$ = defineModel<string>({required: true})
</script>
