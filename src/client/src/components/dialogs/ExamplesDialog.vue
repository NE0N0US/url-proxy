<template>
<q-dialog
	class="artisan-examples-dialog"
	ref="dialogRef"
	transition-duration="0"
	@hide="onDialogHide()"
>
	<div class="bordered-dialog column no-wrap bg-background">
		<div class="sticky-header">
			<q-toolbar class="non-selectable">
				<q-icon name="mdi-file-multiple-outline" size="24px"/>
				<q-toolbar-title>Examples</q-toolbar-title>
				<q-btn
					icon="mdi-close" flat round :ripple="ripple$"
					@click.passive="onDialogOK()"
				/>
			</q-toolbar>
			<q-separator/>
		</div>
		<q-list class="app-color-settings-presets non-selectable">
			<menu-item
				v-for="{icon, label, caption, req} of EXAMPLES" :key="label"
				:icon="icon" :label="label" :caption="caption"
				@click.passive="openExample(req)"
			/>
		</q-list>
	</div>
</q-dialog>
</template>

<script setup lang="ts">
import {useDialogPluginComponent} from 'quasar'
import {AppService, MenuItem, ReqBodyType, ReqService, useReqStore, useUiStore} from '@'

const
	{req$} = useReqStore(),
	{ripple$} = useUiStore(),

	{dialogRef, onDialogHide, onDialogOK} = useDialogPluginComponent(),

	$emit = defineEmits([
		...useDialogPluginComponent.emits,
	]),

	EXAMPLES = AppService.freeze([
		{
			icon: 'mdi-code-json',
			label: 'JSONPlaceholder – Todos',
			caption: 'Get todos using query params',
			req: 'https://jsonplaceholder.typicode.com/todos?userId=1&userId=2',
		},
		{
			icon: 'mdi-code-json',
			label: 'JSONPlaceholder – Create Post',
			caption: 'Create a post using a JSON body',
			req: {
				method: 'POST',
				url: 'https://jsonplaceholder.typicode.com/posts',
				headers: [
					{disable: false, key: 'Content-Type', value: 'application/json'},
				],
				bodyType: ReqBodyType.TEXT,
				body: '{"title":"Hello World","body":"This is a test post."}',
			},
		},
		{
			icon: 'mdi-file-document-check-outline',
			label: 'httpbin – HTML',
			caption: 'Get a simple HTML document with an SRI check',
			req: {
				url: 'httpbin.org/html',
				integrityHashes: 'sha512-VkjZaWWgcqf7UEkgobHl1eg8poEkebMMEhRkFu2XtM9jtLGsamBYvjqh/xUi+lgpUs+eT0WqWx3EY1B7gamXbQ==',
			},
		},
		{
			icon: 'mdi-hexadecimal',
			label: 'httpbin – Random bytes',
			caption: 'Get 64 KiB of random data',
			req: 'httpbin.org/stream-bytes/65536',
		},
		{
			icon: 'mdi-ip-outline',
			label: 'httpbin – IP',
			caption: 'Get your IP address',
			req: 'httpbin.org/ip',
		},
	])

function openExample(example: any) {
	const req = req$.value
	Object.assign(
		req,
		{fetching: false},
		ReqService
			.deserialize(example instanceof Object ? example : {url: example})
			.patchView(req)
			.strip('id')
	)
	onDialogOK()
}
</script>
