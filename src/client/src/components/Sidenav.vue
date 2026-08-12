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
				<div class="sticky-header">
					<q-item>
						<q-item-section class="disabled-text">
							<q-item-label lines="1">
								{{reqs$.length}} Request{{reqs$.length === 1 ? '' : 's'}}
							</q-item-label>
						</q-item-section>
						<q-item-section side>
							<div class="q-ma-sm-minus row no-wrap gap-sm text-text">
								<q-btn
									icon="mdi-plus" flat round :ripple="ripple$"
									@click.passive="open()"
								/>
								<q-btn
									icon="mdi-trash-can-outline"
									flat round :ripple="ripple$"
									@click.passive="close()"
								/>
								<q-btn icon="mdi-dots-vertical" flat round :ripple="ripple$">
									<q-menu
										auto-close
										anchor="bottom right" self="top right"
										transition-show="none" transition-hide="none"
									>
										<q-list class="non-selectable" padding>
											<menu-item
												icon="mdi-content-duplicate"
												label="Duplicate"
												@click.passive="duplicate()"
											/>
											<q-separator spaced/>
											<menu-item
												icon="mdi-database-import-outline"
												label="Import…"
												@click.passive="importReqs()"
											/>
											<menu-item
												icon="mdi-database-export-outline"
												label="Export All…"
												@click.passive="exportReqs()"
											/>
										</q-list>
									</q-menu>
								</q-btn>
							</div>
						</q-item-section>
					</q-item>
					<q-separator/>
				</div>
				<menu-item
					v-for="req of reqs$" :key="req.id"
					class="artisan-mono" translate="no"
					:label="label(req) || 'New Request'"
					@click.passive="open(req)"
				>
					<q-icon v-if="req === req$" name="mdi-check" color="text"/>
					<q-spinner-dots v-else-if="req.fetching" size="24px" color="text"/>
				</menu-item>
			</q-list>
		</div>
	</div>
</q-drawer>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {date, exportFile, useQuasar} from 'quasar'
const {formatDate} = date
import {AppService, MenuItem, Req, ReqService, useReqStore, useUiStore} from '@'

const
	$q = useQuasar(),
	{req$, reqs$, open, close, duplicate} = useReqStore(),

	{ripple$} = useUiStore(),

	$props = defineProps<{
		breakpoint?: number | undefined,
		min?: number | undefined,
		max?: number | undefined,
	}>(),

	breakpoint$ = computed(() => $props.breakpoint ?? Infinity),

	drawer$ = defineModel<boolean>({required: true})

function label(req: Req) {
	return (req.method === 'GET' ? '' : `${req.method} `) + req.url
}

async function importReqs() {
	const jsons = await AppService.importFiles({
		multiple: true,
		accept: 'application/json',
	}) as null | string[]
	if (jsons?.length)
		try {
			const
				reqs = reqs$.value,
				maxId = Math.max(-1, ...reqs.map(({id}) => id))
			reqs.push(...jsons
				.flatMap(json => JSON.parse(json))
				.map((obj, index) => Object.assign(ReqService.deserialize(obj), {
					id: maxId + 1 + index,
				}))
			)
		}
		catch (error) {
			console.error(error)
			$q.notify('Error importing requests')
		}
}

async function exportReqs() {
	try {
		exportFile(
			`artisan-tabs-${formatDate(Date.now(), 'YYYY-MM-DDTHH-mm-ss')}.json`,
			JSON.stringify(await Promise.all(
				reqs$.value.map(ReqService.serialize)
			), undefined, '\t'),
			{mimeType: 'application/json'}
		)
	}
	catch (error) {
		console.error(error)
		$q.notify('Error exporting requests')
	}
}
</script>
