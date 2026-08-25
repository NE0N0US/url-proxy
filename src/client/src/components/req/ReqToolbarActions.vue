<template>
<div class="artisan-req-toolbar-actions row no-wrap gap-sm">
	<q-btn icon="mdi-dots-vertical" flat round :ripple="ripple$">
		<q-menu
			auto-close
			anchor="bottom right" self="top right" :offset="[96, 0]"
			max-width="calc(100dvw - 24px)" max-height="calc(100dvh - 48px)"
			transition-show="none" transition-hide="none"
		>
			<q-list class="non-selectable" padding>
				<menu-item
					icon="mdi-fullscreen"
					label="Expand URL Editor"
					caption="Open URL in expanded editor"
					:disable="req$.fetching || req$.params.textMode"
					@click="$q.dialog({component: ReqUrlDialog})"
				/>
				<menu-item
					icon="mdi-link-variant"
					label="Copy URL"
					caption="Copy encoded request URL to clipboard"
					:disable="!req$.urlValid"
					@click="copyUrl()"
				/>
				<menu-item
					icon="mdi-console-line"
					label="Copy as cURL"
					caption="Copy cURL command to clipboard"
					:disable="!req$.urlValid"
					@click="copyCurl()"
				/>
				<menu-item
					icon="mdi-repeat"
					label="Send Repeatedly"
					caption="Repeat request after each response"
					:disable="!(req$.urlValid && !req$.fetching && !req$.params.textMode)"
					@click="$emit('send', 'repeat')"
				/>
				<q-separator spaced/>
				<menu-item
					icon="mdi-cookie-outline"
					label="Cookies"
					caption="Manage this page's cookies"
					disable
					@click="openCookies()"
				/>
				<menu-item
					icon="mdi-swap-horizontal"
					label="Encode and Decode"
					caption="QR, Punycode, percent-encoding, Base64"
					disable
					@click="openEncodeAndDecode()"
				/>
				<menu-item
					icon="mdi-file-multiple-outline"
					label="Examples"
					caption="Browse request examples"
					@click="openExamples()"
				/>
				<menu-item
					icon="mdi-information-outline"
					label="About"
					caption="About URL Artisan"
					@click="$q.dialog({component: AboutDialog})"
				/>
			</q-list>
		</q-menu>
	</q-btn>
	<q-btn icon="mdi-palette-outline" flat round :ripple="ripple$">
		<q-menu
			anchor="bottom right" self="top right" :offset="[48, 0]"
			max-width="calc(100dvw - 24px)" max-height="calc(100dvh - 48px)"
			transition-show="none" transition-hide="none"
		>
			<app-color-settings/>
		</q-menu>
		<q-tooltip :delay="300" transition-duration="0">
			Theme
		</q-tooltip>
	</q-btn>
	<slot/>
</div>
</template>

<script setup lang="ts">
import {copyToClipboard, useQuasar} from 'quasar'
import {
	AboutDialog,
	AppColorSettings,
	CurlService,
	MenuItem,
	Req,
	ReqUrlDialog,
	useReqStore,
	useUiStore,
} from '@'

const
	$q = useQuasar(),
	{req$} = useReqStore(),
	{ripple$} = useUiStore(),

	$emit = defineEmits<{
		'send': ['repeat' | undefined],
	}>()

async function copyUrl() {
	try {
		const url = (await req$.value.urlFull)!
		await copyToClipboard(url)
	}
	catch (error) {
		console.error(error)
		$q.notify('Error copying URL')
	}
}

async function copyCurl() {
	try {
		const curl = await CurlService.toCurl(req$.value)
		await copyToClipboard(curl)
	}
	catch (error) {
		console.error(error)
		$q.notify('Error copying cURL command')
	}
}

function openCookies() {
	// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#notes
}
function openEncodeAndDecode() {}

function randomString(bytes: number) {
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
}
</script>
