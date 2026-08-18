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
		:extensions="extensions$"
	/>
	<div
		v-if="lang$ === 'javascript' || lang$ === 'json'"
		class="q-pa-xs row no-wrap gap-xs"
	>
		<q-btn
			label="Minify"
			icon="mdi-arrow-collapse-vertical"
			:disable="!value$"
			no-caps no-wrap flat rounded
			@click.passive="minify()"
		/>
		<q-btn
			label="Prettify"
			icon="mdi-format-indent-increase"
			:disable="!value$"
			no-caps no-wrap flat rounded
			@click.passive="prettify()"
		/>
	</div>
</div>
</template>

<style scoped lang="scss">
.v-codemirror :deep(.cm-editor) {
	flex-grow: 1;
}

.q-btn {
	min-height: 40px;
}
</style>

<script setup lang="ts">
import {computed} from 'vue'
import {useQuasar} from 'quasar'
import {Codemirror} from 'vue-codemirror'
import {EditorView} from 'codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {json} from '@codemirror/lang-json'
import {html} from '@codemirror/lang-html'
import {xml} from '@codemirror/lang-xml'
import {minify as minifyJs} from 'terser'
import {format as prettifyJs} from 'prettier'
import * as babel from 'prettier/plugins/babel'
import * as estree from 'prettier/plugins/estree'

const
	$q = useQuasar(),

	$props = defineProps<{
		noLangOptions?: boolean | undefined,
		disabled?: boolean | undefined,
		tabSize?: number | undefined,
		placeholder?: string | undefined,
		noLineWrap?: boolean | undefined,
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

	lang$ = defineModel<null | keyof typeof langExtensions>('lang', {default: null}),

	extensions$ = computed(() => {
		const lang = lang$.value
		return [
			...(lang !== null && lang in langExtensions) ? [langExtensions[lang]] : [],
			...$props.noLineWrap ? [] : [EditorView.lineWrapping],
		]
	}),

	value$ = defineModel<string>({required: true})

async function minify() {
	switch (lang$.value) {
		case 'javascript':
			try {
				value$.value = (await minifyJs(value$.value, {
					compress: false,
					mangle: false,
					format: {
						ecma: 2025,
						keep_numbers: true,
						quote_style: 3,
					},
				})).code ?? ''
			}
			catch (error) {
				console.error(error)
				$q.notify('Error minifying JavaScript code')
			}
			break
		case 'json':
			try {
				value$.value = JSON.stringify(JSON.parse(value$.value))
			}
			catch (error) {
				console.error(error)
				$q.notify('Error minifying JSON data')
			}
			break
	}
}

async function prettify() {
	switch (lang$.value) {
		case 'javascript':
			try {
				value$.value = await prettifyJs(value$.value, {
					parser: 'babel',
					plugins: [babel, estree],
					printWidth: 120,
					tabWidth: 4,
					useTabs: true,
					semi: false,
					singleQuote: true,
					quoteProps: 'preserve',
					trailingComma: 'es5',
					bracketSpacing: false,
					arrowParens: 'avoid',
				})
			}
			catch (error) {
				console.error(error)
				$q.notify('Error prettifying JavaScript code')
			}
			break
		case 'json':
			try {
				value$.value = JSON.stringify(JSON.parse(value$.value), undefined, '\t')
			}
			catch (error) {
				console.error(error)
				$q.notify('Error prettifying JSON data')
			}
			break
	}
}
</script>
