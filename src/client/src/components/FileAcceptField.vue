<template>
<div class="artisan-file-accept-field">
	<q-input
		class="fit" :class="{'cursor-not-allowed': disable}"
		spellcheck="false" autocomplete="off"
		:inert="disable"
		ref="input"
		label="Accept"
		:shadow-text="accept$ ? ' ' : ACCEPT_OPTIONS[0]!.value"
		v-model="accept$"
		:disable="disable"
		borderless hide-bottom-space dense
		input-class="artisan-mono"
		@blur="accept$ ||= ACCEPT_OPTIONS[0]!.value"
		@keydown.enter.passive="$emit('enter')"
	>
		<template #prepend>
			<q-icon :name="acceptIcon(accept$) ?? 'mdi-pencil-outline'" color="text"/>
		</template>
		<template #after>
			<q-btn
				icon="mdi-chevron-down"
				:disable="disable"
				flat round color="text" :ripple="ripple$"
			>
				<q-menu
					auto-close
					:offset="[input$?.$el.offsetWidth - 44, 0]"
					transition-show="none" transition-hide="none"
					@before-show="acceptLast$ = accept$"
				>
					<q-list
						class="non-selectable"
						:style="{'min-width': input$?.$el.offsetWidth - 2 + 'px'}"
						padding
					>
						<menu-item
							v-for="option of ACCEPT_OPTIONS" :key="option.value"
							:icon="option.icon"
							:label="option.label"
							@click.passive="accept$ = option.value"
						>
							<q-icon v-if="acceptLast$ === option.value" name="mdi-check" color="text"/>
						</menu-item>
					</q-list>
				</q-menu>
			</q-btn>
		</template>
	</q-input>
</div>
</template>

<script setup lang="ts">
import {ref, useTemplateRef} from 'vue'
import {type QInput} from 'quasar'
import {AppState, MenuItem} from '@'

const
	{ripple$} = AppState,

	input$ = useTemplateRef<QInput>('input'),

	$props = defineProps<{
		disable?: boolean | undefined,
	}>(),

	$emit = defineEmits<{
		enter: [],
	}>(),

	accept$ = defineModel<string>({required: true}),

	/** prevents layout shift */
	acceptLast$ = ref(''),

	ACCEPT_OPTIONS = Object.freeze([
		{icon: 'mdi-file-multiple-outline', label: 'All files', value: '*/*'},
		{icon: 'mdi-image-outline', label: 'Images', value: 'image/*'},
		{icon: 'mdi-video-outline', label: 'Videos', value: 'video/*'},
		{icon: 'mdi-music-note-outline', label: 'Audio', value: 'audio/*'},
	])

function acceptIcon(value: string) {
	return ACCEPT_OPTIONS.find(method => method.value === value)?.icon
}

defineExpose({
	focus: () => input$.value?.focus(),
	select: () => input$.value?.select(),
})
</script>
