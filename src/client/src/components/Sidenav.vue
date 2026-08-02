<template>
<q-drawer
	class="artisan-sidenav non-selectable"
	side="right"
	:overlay="$q.screen.width < breakpoint$"
	:behavior="$q.screen.width < breakpoint$ ? 'mobile' : 'desktop'"
	:model-value="$q.screen.width < breakpoint$ ? drawer$ : true"
	@update:model-value="drawer$ = $event"
	bordered
	:width="$q.screen.width < breakpoint$ ? (min ?? 320)
		: Math.min((min ?? 320) + $q.screen.width - breakpoint$, (max ?? 600))"
	@keydown.esc.passive="drawer$ = false"
>
	<div class="min-height-screen max-height-screen">
		<div class="fit overflow-auto">
			<q-list @pointerdown.passive.stop @mousedown.passive.stop>
				<div class="sticky-list-header">
					<q-item>
						<q-item-section class="disabled-text">
							<q-item-label lines="1">Tabs (1)</q-item-label>
						</q-item-section>
						<q-item-section side>
							<div class="q-ma-sm-minus row no-wrap gap-sm text-text">
								<q-btn icon="mdi-plus" flat round :ripple="ripple$"/>
								<q-btn icon="mdi-trash-can-outline" flat round :ripple="ripple$"/>
								<q-btn icon="mdi-content-duplicate" flat round :ripple="ripple$"/>
							</div>
						</q-item-section>
					</q-item>
					<q-separator/>
				</div>
				<!-- translate="no" -->
				<menu-item label="Current Tab">
					<q-icon name="mdi-check" color="text"/>
				</menu-item>
			</q-list>
		</div>
	</div>
</q-drawer>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {AppState, MenuItem} from '@'

const
	{ripple$} = AppState,

	$props = defineProps<{
		breakpoint?: number | undefined,
		min?: number | undefined,
		max?: number | undefined,
	}>(),

	breakpoint$ = computed(() => $props.breakpoint ?? Infinity),

	drawer$ = defineModel<boolean>({required: true})
</script>
