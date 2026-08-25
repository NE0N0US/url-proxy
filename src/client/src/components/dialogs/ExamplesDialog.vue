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
		<div class="doc-section">
			WIP
		</div>
	</div>
</q-dialog>
</template>

<script setup lang="ts">
import {useDialogPluginComponent} from 'quasar'
import {useUiStore} from '@'

const
	{ripple$} = useUiStore(),

	{dialogRef, onDialogHide, onDialogOK} = useDialogPluginComponent(),

	$emit = defineEmits([
		...useDialogPluginComponent.emits,
	])

/*function randomString(bytes: number) {
	let result = ''
	while (result.length < bytes)
		result += new TextDecoder('ibm866')
			.decode(crypto.getRandomValues(new Uint8Array(bytes)))
			.replace(/\s/g, '')
	return result.slice(0, bytes)
}

function openExamples() {
	const req = req$.value
	Object.assign(req, new Req().patchView(req), {id: req.id})
	req.url = 'https://chatgpt.com/?temporary-chat=true'
	req.headers.rows = Array(500).fill(null).map(() => ({
		disable: Math.random() > 0.5,
		key: randomString(80),
		value: randomString(80),
	}))
}*/
</script>
