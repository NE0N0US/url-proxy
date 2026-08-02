<template>
<div class="artisan-file-input-field min-width">
	<q-file
		class="fit overflow-hidden"
		ref="input"
		name="file"
		:multiple="Array.isArray(value$)"
		:accept="accept"
		:label="hideLabel ? undefined : Array.isArray(value$) ? 'Files' : 'File'"
		v-model="value$"
		borderless hide-bottom-space dense
		:rules="required ? [value => Array.isArray(value) ? !!value.length : !!value] : []"
		@update:model-value="input$?.blur()"
		@focus="input$!.hasError ? $emit('error') : undefined"
	>
		<template #file="{index}">
			<div
				v-if="!index"
				class="file-value-row fit row no-wrap items-center justify-between text-text"
				translate="no"
			>
				<span class="ellipsis">
					<span v-if="names$.length <= 1">
						{{names$[0]}}
					</span>
					<template v-else>
						Files ({{names$.length}})
					</template>
				</span>
				<span class="file-value-size text-no-wrap">
					{{humanStorageSize(size$)}}
				</span>
			</div>
		</template>
		<template #after>
			<q-btn
				v-if="!$slots.after"
				icon="mdi-file-remove-outline"
				:disable="!value$ || Array.isArray(value$) && !value$.length"
				flat round color="text" :ripple="ripple$"
				@click.passive="value$ = Array.isArray(value$) ? [] : null"
			/>
			<slot v-else name="after"/>
		</template>
		<q-tooltip
			v-if="Array.isArray(value$) && value$.length > 1"
			:delay="300" :hide-delay="500"
			:model-value="tooltip$ || pinTooltip$"
			@update:model-value="tooltip$ = $event"
			anchor="bottom left" self="top left" :offset="[13, 0]"
			transition-show="fade" transition-hide="fade"
			@click.passive="pinTooltip$ = !pinTooltip$"
		>
			<div class="disabled-text">
				Click this tooltip to {{pinTooltip$ ? 'unpin' : 'pin'}}
			</div>
			<span class="tooltip" translate="no">
				{{names$.join('\n')}}
			</span>
		</q-tooltip>
	</q-file>
</div>
</template>

<style scoped lang="scss">
.file-value-row {
	gap: 6px;

	.file-value-size {
		opacity: var(--opacity-disabled);
	}
}

.tooltip {
	white-space: pre-wrap;
}

.q-file {
	:deep(.q-field__label) {
		top: 12px;
	}

	:deep(.q-field__append) {
		display: none;
	}
}
</style>

<script setup lang="ts">
import {computed, ref, useTemplateRef} from 'vue'
import {format, type QFile} from 'quasar'
const {humanStorageSize} = format
import {AppState} from '@'

const
	{ripple$} = AppState,

	input$ = useTemplateRef<typeof QFile>('input'),

	$props = defineProps<{
		accept?: string | undefined,
		hideLabel?: boolean | undefined,
		required?: boolean | undefined,
	}>(),

	$emit = defineEmits<{
		'error': [],
	}>(),

	value$ = defineModel<null | File | File[]>({required: true}),

	names$ = computed(() => {
		const value = value$.value
		return Array.isArray(value) && value.length > 1
			? value
				.map(({name}) => name)
				.sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))
			: [((value as File[])[0] ?? value as File)?.name ?? '']
	}),

	size$ = computed(() => {
		const value = value$.value
		return Array.isArray(value)
			? value.reduce((sum, {size}) => sum + size, 0)
			: value?.size ?? 0
	}),

	tooltip$ = ref(false),
	pinTooltip$ = ref(false)

defineExpose({
	focus: () => input$.value?.focus(),
	select: () => input$.value?.pickFiles(),
})
</script>
