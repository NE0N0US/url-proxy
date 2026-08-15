<template>
<q-layout class="bg-background text-text" :inert="loading$" view="lHr lpR lFr">
	<sidenav :breakpoint="SIDENAV_BP" v-model="drawer$"/>
	<q-page-container>
		<main
			class="max-width-md max-width-separators min-height-screen column no-wrap"
			:inert="drawer$ && $q.screen.width < SIDENAV_BP"
		>
			<splitter-accordion class="grow" v-model="collapse$">
				<template #header-start>
					<q-toolbar class="non-selectable">
						<q-btn
							:icon="collapse$ === 'start' ? 'mdi-chevron-down' : 'mdi-chevron-up'"
							flat round :ripple="ripple$"
							@click.passive="collapse$ = collapse$ === 'start' ? null : 'start'"
						/>
						<q-toolbar-title>Request</q-toolbar-title>
						<div class="row no-wrap gap-sm">
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
											@click.passive="expandUrlEditor()"
										/>
										<menu-item
											icon="mdi-link-variant"
											label="Copy URL"
											caption="Copy encoded request URL to clipboard"
											:disable="!req$.urlValid"
											@click.passive="copyUrl()"
										/>
										<menu-item
											icon="mdi-console-line"
											label="Copy as cURL"
											caption="Copy cURL command to clipboard"
											:disable="!req$.urlValid"
											@click.passive="copyCurl()"
										/>
										<menu-item
											icon="mdi-file-download-outline"
											label="Send and Download"
											caption="Download response without displaying body"
											:disable="!(req$.urlValid && !req$.fetching && !req$.params.textMode)"
											@click.passive="send('download')"
										/>
										<menu-item
											icon="mdi-repeat"
											label="Send Repeatedly"
											caption="Repeat request after each response"
											:disable="!(req$.urlValid && !req$.fetching && !req$.params.textMode)"
											@click.passive="send('repeat')"
										/>
										<q-separator spaced/>
										<menu-item
											icon="mdi-cookie-outline"
											label="Cookies"
											caption="Manage this page's cookies"
											disable
											@click.passive="openCookies()"
										/>
										<menu-item
											icon="mdi-swap-horizontal"
											label="Encode and Decode"
											caption="QR, Punycode, percent-encoding, Base64"
											disable
											@click.passive="openEncodeAndDecode()"
										/>
										<menu-item
											icon="mdi-file-multiple-outline"
											label="Examples"
											caption="Browse request examples"
											@click.passive="openExamples()"
										/>
										<menu-item
											icon="mdi-information-outline"
											label="About"
											caption="About URL Artisan"
											disable
											@click.passive="openAbout()"
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
							<q-btn
								v-if="$q.screen.width < SIDENAV_BP"
								icon="mdi-tab"
								flat round :ripple="ripple$"
								@click.passive="drawer$ = true"
							>
								<q-tooltip :delay="300" transition-duration="0">
									Tabs
								</q-tooltip>
							</q-btn>
						</div>
					</q-toolbar>
				</template>
				<template #content-start>
					<div class="full-width grow column no-wrap overflow-hidden">
						<div class="url-field-pair row no-wrap" :class="{'cursor-not-allowed': req$.fetching}">
							<http-method-field
								class="no-shrink"
								ref="method-input"
								:disable="req$.fetching || req$.params.textMode"
								:offset-x="4"
								v-model="req$.method"
								@blur="req$.method = 'GET'"
								@enter="urlInput$?.focus()"
							/>
							<q-separator vertical/>
							<req-url-field
								class="grow"
								ref="url-input"
								:valid="req$.urlValid"
								:fetching="req$.fetching"
								:disable="req$.params.textMode"
								v-model="req$.url"
								@paste="pasteCurl($event)"
								@start="send()" @stop="req$.fetching = false"
							/>
						</div>
						<q-separator/>
						<div class="grow column no-wrap overflow-auto">
							<div class="grow column no-wrap">
								<q-tabs
									breakpoint="0"
									mobile-arrows
									:align="$q.screen.width >= 600 ? 'left' : 'justify'"
									narrow-indicator inline-label no-caps
									v-model="req$.tab"
								>
									<q-tab
										icon="mdi-magnify"
										label="Params"
										:alert="!!(req$.params.textValue || req$.params.rows.length)"
										:alert-icon="req$.params.textValue ? 'mdi-content-save-edit-outline' : undefined"
										name="params"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-table"
										label="Headers"
										:alert="!!(req$.headers.textValue || req$.headers.rows.length)"
										:alert-icon="req$.headers.textValue ? 'mdi-content-save-edit-outline' : undefined"
										name="headers"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-text-box-outline"
										label="Body"
										:alert="!!(req$.body.formTextValue || req$.body.value && (req$.body.value as any)?.length !== 0)"
										:alert-icon="req$.body.formTextValue ? 'mdi-content-save-edit-outline' : undefined"
										name="body"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-tune-variant"
										label="Options"
										:alert="!!(req$.options.includeCredentials || req$.options.followRedirects ||
											req$.options.integrityHashes.value && !req$.options.integrityHashes.disable ||
											req$.options.curlProxy.server.value && !req$.options.curlProxy.server.disable)"
										name="options"
										:ripple="ripple$"
									/>
								</q-tabs>
								<q-separator/>
								<div class="grow column no-wrap" :class="{'cursor-not-allowed': req$.fetching}">
									<q-tab-panels
										class="grow bg-background text-text"
										:inert="req$.fetching"
										:keep-alive="false"
										v-model="req$.tab"
									>
										<q-tab-panel class="overflow-hidden q-pa-none" name="params">
											<req-kv-table
												class="fit"
												v-model:text-mode="req$.params.textMode"
												v-model:text-value="req$.params.textValue"
												v-model="req$.params.rows"
												v-model:pagination="req$.params.pagination"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="headers">
											<req-kv-table
												class="fit"
												v-model:text-mode="req$.headers.textMode"
												v-model:text-value="req$.headers.textValue"
												v-model="req$.headers.rows"
												v-model:pagination="req$.headers.pagination"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="body">
											<req-body-form
												class="fit"
												v-model:type="req$.body.type"
												v-model:form-text-mode="req$.body.formTextMode"
												v-model:form-text-value="req$.body.formTextValue"
												v-model:form-pagination="req$.body.formPagination"
												v-model:file-accept="req$.body.fileAccept"
												v-model:text-lang="req$.body.textLang"
												v-model="req$.body.value"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="options">
											<req-options-form
												class="fit"
												:disable-extract="disableExtract$"
												:table-height="reqTabHeight$"
												v-model="req$.options"
												@extract-curl-proxy="extractCurlProxy()"
											/>
										</q-tab-panel>
									</q-tab-panels>
								</div>
							</div>
							<q-resize-observer debounce="0" @resize="reqTabHeight$ = $event.height"/>
						</div>
					</div>
				</template>
				<template #header-end>
					<q-toolbar class="non-selectable">
						<q-btn
							:icon="collapse$ === 'end' ? 'mdi-chevron-down' : 'mdi-chevron-up'"
							flat round :ripple="ripple$"
							@click.passive="collapse$ = collapse$ === 'end' ? null : 'end'"
						/>
						<q-toolbar-title>Response</q-toolbar-title>
						<q-btn icon="mdi-dots-vertical" :disable="collapse$ === 'end'" flat round :ripple="ripple$"/>
					</q-toolbar>
				</template>
				<template #content-end>
					<div class="q-pa-toolbar">Response…</div>
				</template>
			</splitter-accordion>
		</main>
	</q-page-container>
</q-layout>
<div class="fullscreen" v-if="loading$"></div>
</template>

<style scoped lang="scss">
.q-layout {
	min-height: 0 !important;

	:deep(.q-drawer__opener) {
		display: none;
	}
}
</style>

<script setup lang="ts">
import {computed, onMounted, ref, useTemplateRef} from 'vue'
import {copyToClipboard, useQuasar} from 'quasar'
import {useEventListener, useMagicKeys, useTitle, whenever} from '@vueuse/core'
import {toUnicode} from 'punycode'
import {
	AppService,
	CurlService,
	Sidenav,
	SplitterAccordion,
	MenuItem,
	AppColorSettings,
	HttpMethodField,
	Req,
	ReqUrlField,
	ReqKvTable,
	ReqBodyForm,
	ReqOptionsForm,
	ReqService,
	ReqUrlDialog,
	useReqStore,
	useUiStore,
} from '@'

const
	$q = useQuasar(),
	{req$, touched$} = useReqStore(),
	{ripple$} = useUiStore(),

	methodInput$ = useTemplateRef<typeof HttpMethodField>('method-input'),
	urlInput$ = useTemplateRef<typeof ReqUrlField>('url-input'),
	reqTabHeight$ = ref(0),

	keys$ = useMagicKeys(),
	watcherAltM = whenever(keys$.alt_m!, () => methodInput$.value!.focus()),
	watcherAltU = whenever(keys$.alt_u!, () => urlInput$.value!.focus()),
	watcherAltP = whenever(keys$.alt_p!, () => req$.value.tab = 'params'),
	watcherAltH = whenever(keys$.alt_h!, () => req$.value.tab = 'headers'),
	watcherAltB = whenever(keys$.alt_b!, () => req$.value.tab = 'body'),
	watcherAltO = whenever(keys$.alt_o!, () => req$.value.tab = 'options'),

	drawer$ = ref(false),
	collapse$ = ref<null | 'start' | 'end'>('end'),
	loading$ = ref(false),

	title$ = useTitle(() => 'URL Artisan' + (req$.value.urlValid ? `: ${
		decodeURI(toUnicode(new URL(
			AppService.resolveUrl(req$.value.url)
		).hostname))
	}` : '')),

	disableExtract$ = computed(() =>
		!req$.value.urlValid || !req$.value.params.rows
			.some(({disable, key, value}) => !disable && key === 'url' && value)
	),

	listenerPreventUnload = useEventListener(window, 'beforeunload', event => {
		if (touched$.value) {
			event.preventDefault()
			event.returnValue = true
		}
	}),

	SIDENAV_BP = 1_800

onMounted(() => setTimeout(() => touched$.value = false))

function expandUrlEditor() {
	$q.dialog({component: ReqUrlDialog})
}

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

function pasteCurl(event: ClipboardEvent) {
	try {
		const text = event.clipboardData?.getData('text')
		if (text?.trim().match(/^curl(\s|\\)/)) {
			req$.value = CurlService.fromCurl(text)
			event.preventDefault()
		}
	}
	catch (error) {
		console.error(error)
		$q.notify('Error pasting cURL command')
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

function openAbout() {}

/** TODO: header from body (application/x-www-form-urlencoded, JS, JSON, XML), cache: no-store */
function send(command?: 'download' | 'repeat') {
	const
		req = req$.value,
		method = req.options.curlProxy.method || req.method,
		hasBody = !!req.body.value && (req.body.value as any)?.length !== 0,
		hasCurlProxy = !!(req.options.curlProxy.server.value && !req.options.curlProxy.server.disable),
		hasCurlProxyBody = hasCurlProxy &&
			!!req.options.curlProxy.body.value &&
			(req.options.curlProxy.body.value as any)?.length !== 0
	if (['GET', 'OPTIONS'].includes(method) && hasBody || hasCurlProxyBody)
		$q.notify(method + ' request cannot have a body')
	else
		req$.value.fetching = true
}

function extractCurlProxy() {
	try {
		ReqService.extractCurlProxy(req$.value)
	}
	catch (error) {
		console.error(error)
		$q.notify('Error parsing cURL Proxy URL')
	}
}

/* TODO:
code editor: minify/beautify
response
dialogs: cookies, encode/decode, examples, about
keyboard controls: alt-*, table pagination, code editor keymaps

https://vueuse.org/core/useWebWorkerFn/
https://vueuse.org/core/useNetwork/
https://vueuse.org/core/useFetch/
https://vueuse.org/core/useTimestamp/
https://vueuse.org/shared/useTimeout/
*/

</script>
