<template>
<div class="artisan-req-body-form column no-wrap">
	<div class="q-px-md q-py-xs column">
		<q-option-group
			class="non-selectable"
			inline
			v-model="type$"
			:options="bodyTypes$"
			color="text"
			@update:model-value="resetValue($event, type$)"
		/>
	</div>
	<q-separator v-if="value$ !== null || type$ === ReqBodyType.FILE"/>
	<q-input
		v-if="type$ === ReqBodyType.TEXT && typeof value$ === 'string'"
		class="grow q-px-md q-py-xs shadow-text-always"
		spellcheck="false" autocomplete="off"
		:shadow-text="value$ ? ' ' : 'Input text'"
		autogrow
		v-model="<string>value$"
		borderless hide-bottom-space dense
		input-class="artisan-mono"
	/>
	<template v-else-if="type$ === ReqBodyType.FILE && (value$ === null || value$ instanceof FileClass)">
		<div class="url-field-pair row no-wrap">
			<file-accept-field
				class="no-shrink"
				:offset-x="4"
				v-model="fileAccept$"
				@enter="fileInput$?.focus()"
			/>
			<q-separator vertical/>
			<file-input-field
				class="grow"
				ref="file-input"
				:accept="fileAccept$"
				v-model="value$"
			/>
		</div>
		<div class="no-height">
			<q-separator/>
		</div>
	</template>
	<req-kv-table
		v-else-if="[ReqBodyType.FORM_URLENCODED, ReqBodyType.FORM_MULTIPART].includes(type$) && Array.isArray(value$)"
		class="grow"
		:multipart-form="type$ === ReqBodyType.FORM_MULTIPART"
		v-model:text-mode="formTextMode$"
		v-model:text-value="formTextValue$"
		v-model="<ReqKV[]>value$"
		v-model:pagination="formPagination$"
	>
		<q-btn
			:icon="type$ === ReqBodyType.FORM_URLENCODED ? 'mdi-file-multiple-outline' : 'mdi-file-remove-outline'"
			flat round color="text" :ripple="ripple$"
			@click.passive="type$ = resetValue(
				type$ === ReqBodyType.FORM_URLENCODED ? ReqBodyType.FORM_MULTIPART : ReqBodyType.FORM_URLENCODED,
			type$)"
		/>
	</req-kv-table>
</div>
</template>

<style scoped lang="scss">
.artisan-file-input-field :deep(.q-file__dnd) {
	outline-offset: 3px !important;
	right: 3px;
	left: -8px;
}
</style>

<script setup lang="ts">
import {computed, useTemplateRef} from 'vue'
import {AppState, FileAcceptField, FileInputField, ReqKvTable, ReqBodyType, type ReqBody, type ReqKV} from '@'

const
	{ripple$} = AppState,

	FileClass = File,

	fileInput$ = useTemplateRef<typeof FileInputField>('file-input'),

	type$ = defineModel<ReqBodyType>('type', {required: true}),

	bodyTypes$ = computed(() => [
		{label: 'None', value: ReqBodyType.NONE},
		{label: 'Text', value: ReqBodyType.TEXT},
		{label: 'File', value: ReqBodyType.FILE},
		{label: 'Form', value: type$.value === ReqBodyType.FORM_MULTIPART
			? ReqBodyType.FORM_MULTIPART : ReqBodyType.FORM_URLENCODED},
	]),

	formTextMode$ = defineModel<boolean>('form-text-mode', {required: true}),
	formTextValue$ = defineModel<string>('form-text-value', {required: true}),

	formPagination$ = defineModel<{
		sortBy?: string | null,
		descending?: boolean,
		filter?: Partial<{query: string, regex: boolean}> | undefined,
		rowsPerPage: number,
		page: number,
	}>('form-pagination', {required: true}),

	fileAccept$ = defineModel<string>('file-accept', {required: true}),

	value$ = defineModel<ReqBody>()

function resetValue(type: ReqBodyType, oldType: ReqBodyType) {
	formTextMode$.value = false
	formTextValue$.value = ''
	if (type !== oldType)
		switch(type) {
			case ReqBodyType.NONE:
			case ReqBodyType.TEXT:
				value$.value = ''
				break
			case ReqBodyType.FILE:
				value$.value = null
				break
			case ReqBodyType.FORM_URLENCODED:
			case ReqBodyType.FORM_MULTIPART:
				value$.value = [ReqBodyType.FORM_URLENCODED, ReqBodyType.FORM_MULTIPART].includes(oldType)
					? (value$.value as ReqKV[]).filter(({value}) => !Array.isArray(value))
					: []
				break
		}
	return type
}
</script>
