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
							<q-btn
								icon="mdi-dots-vertical"
								:disable="collapse$ === 'start'"
								flat round :ripple="ripple$"
							>
								<q-menu
									auto-close
									anchor="bottom right" self="top right" :offset="[96, 0]"
									max-width="calc(100dvw - 24px)" max-height="calc(100dvh - 48px)"
									transition-show="none" transition-hide="none"
								>
									<q-list class="non-selectable" padding>
										<menu-item
											icon="mdi-fullscreen"
											label="Fullscreen URL Editor…"
											caption="Open URL in fullscreen editor"
											:disable="fetching$ || reqParamsTextMode$"
										/>
										<menu-item
											icon="mdi-restore"
											label="Reset"
											caption="Cancel request and restore initial state"
											@click.passive="reset()"
										/>
										<menu-item
											icon="mdi-link-variant"
											label="Copy URL"
											caption="Copy encoded request URL to clipboard"
											:disable="!reqUrlValid$"
										/>
										<menu-item
											icon="mdi-console-line"
											label="Copy as cURL"
											caption="Copy cURL command to clipboard"
											:disable="!reqUrlValid$"
										/>
										<menu-item
											icon="mdi-file-download-outline"
											label="Send and Download"
											caption="Download response without displaying body"
											:disable="!(reqUrlValid$ && !fetching$ && !reqParamsTextMode$)"
											@click.passive="send('download')"
										/>
										<menu-item
											icon="mdi-repeat"
											label="Send Repeatedly"
											caption="Repeat request after each response"
											:disable="!(reqUrlValid$ && !fetching$ && !reqParamsTextMode$)"
											@click.passive="send('repeat')"
										/>
										<menu-item
											icon="mdi-cookie-outline"
											label="Cookies…"
											caption="Manage this page's cookies"
										/>
										<menu-item
											icon="mdi-swap-horizontal"
											label="Encode and Decode…"
											caption="Punycode, percent-encoding, Base64"
										/>
										<menu-item
											icon="mdi-file-multiple-outline"
											label="Examples…"
											caption="Browse request examples"
										/>
										<menu-item
											icon="mdi-information-outline"
											label="About…"
											caption="About URL Artisan"
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
							</q-btn>
							<q-btn
								v-if="$q.screen.width < SIDENAV_BP"
								icon="mdi-tab"
								flat round :ripple="ripple$"
								@click.passive="drawer$ = true"
							/>
						</div>
					</q-toolbar>
				</template>
				<template #content-start>
					<div class="full-width grow column no-wrap overflow-hidden">
						<div class="url-field-pair row no-wrap" :class="{'cursor-not-allowed': fetching$}">
							<http-method-field
								class="no-shrink"
								:disable="fetching$ || reqParamsTextMode$"
								v-model="reqMethod$"
								@enter="urlInput$?.focus()"
							/>
							<q-separator vertical/>
							<ReqUrlField
								class="grow"
								ref="url-input"
								:valid="reqUrlValid$"
								:fetching="fetching$"
								:disable="reqParamsTextMode$"
								v-model="reqUrl$"
								@paste="handlePasteCurl($event)"
								@start="send()" @stop="fetching$ = false"
							/>
						</div>
						<q-separator/>
						<div class="grow column no-wrap overflow-auto">
							<div class="grow column no-wrap">
								<q-tabs
									breakpoint="0"
									outside-arrows mobile-arrows
									align="left" narrow-indicator
									inline-label no-caps
									v-model="reqTab$"
								>
									<q-tab
										icon="mdi-magnify"
										label="Params"
										:alert="!!(reqParamsTextValue$ || reqParams$.length)"
										:alert-icon="reqParamsTextValue$ ? 'mdi-content-save-edit-outline' : undefined"
										name="params"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-table"
										label="Headers"
										:alert="!!(reqHeadersTextValue$ || reqHeaders$.length)"
										:alert-icon="reqHeadersTextValue$ ? 'mdi-content-save-edit-outline' : undefined"
										name="headers"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-text-box-outline"
										label="Body"
										:alert="!!(reqBodyFormTextValue$ || reqBody$ && (reqBody$ as any)?.length !== 0)"
										:alert-icon="reqBodyFormTextValue$ ? 'mdi-content-save-edit-outline' : undefined"
										name="body"
										:ripple="ripple$"
									/>
									<q-tab
										icon="mdi-tune-variant"
										label="Options"
										:alert="true"
										name="options"
										:ripple="ripple$"
									/>
								</q-tabs>
								<q-separator/>
								<div class="grow column no-wrap" :class="{'cursor-not-allowed': fetching$}">
									<q-tab-panels
										class="grow bg-background text-text"
										:inert="fetching$"
										:keep-alive="false"
										v-model="reqTab$"
									>
										<q-tab-panel class="overflow-hidden q-pa-none" name="params">
											<req-kv-table
												class="fit"
												v-model:text-mode="reqParamsTextMode$"
												v-model:text-value="reqParamsTextValue$"
												v-model="reqParams$"
												v-model:pagination="reqParamsPagination$"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="headers">
											<req-kv-table
												class="fit"
												v-model:text-mode="reqHeadersTextMode$"
												v-model:text-value="reqHeadersTextValue$"
												v-model="reqHeaders$"
												v-model:pagination="reqHeadersPagination$"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="body">
											<req-body-form
												class="fit"
												v-model:type="reqBodyType$"
												v-model:form-text-mode="reqBodyFormTextMode$"
												v-model:form-text-value="reqBodyFormTextValue$"
												v-model:file-accept="reqBodyFileAccept$"
												v-model="reqBody$"
												v-model:form-pagination="reqBodyFormPagination$"
											/>
										</q-tab-panel>
										<q-tab-panel class="overflow-hidden q-pa-none" name="options">
											<req-options-form class="fit" v-model="reqOptions$"/>
										</q-tab-panel>
									</q-tab-panels>
								</div>
							</div>
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
import {ref, useTemplateRef} from 'vue'
import {useTitle} from '@vueuse/core'
import {toUnicode} from 'punycode'
import {
	AppState,
	AppService,
	Sidenav,
	SplitterAccordion,
	MenuItem,
	AppColorSettings,
	HttpMethodField,
	ReqUrlField,
	ReqKvTable,
	ReqBodyForm,
	ReqOptionsForm,
	ReqBodyType,
	ReqOptions,
} from '@'

// #region - state

const
	{reqMethod$, reqUrl$, reqUrlValid$, reqParams$, reqHeaders$,
		reqBodyType$, reqBody$, reqOptions$, fetching$, ripple$} = AppState,

	urlInput$ = useTemplateRef<typeof ReqUrlField>('url-input'),

	loading$ = ref(false),
	drawer$ = ref(false),
	collapse$ = ref<null | 'start' | 'end'>('end'),
	reqTab$ = ref('params'),
	reqParamsTextMode$ = ref(false),
	reqParamsTextValue$ = ref(''),
	reqParamsPagination$ = ref({page: 1, rowsPerPage: 1}),
	reqHeadersTextMode$ = ref(false),
	reqHeadersTextValue$ = ref(''),
	reqHeadersPagination$ = ref({page: 1, rowsPerPage: 1}),
	reqBodyFormTextMode$ = ref(false),
	reqBodyFormTextValue$ = ref(''),
	reqBodyFormPagination$ = ref({page: 1, rowsPerPage: 1}),
	reqBodyFileAccept$ = ref('*/*')

function reset() {
	reqMethod$.value = 'GET'
	reqUrl$.value = ''
	reqTab$.value = 'params'
	reqParams$.value = []
	reqParamsTextMode$.value = false
	reqParamsTextValue$.value = ''
	reqParamsPagination$.value = {page: 1, rowsPerPage: 1}
	reqHeaders$.value = []
	reqHeadersTextMode$.value = false
	reqHeadersTextValue$.value = ''
	reqHeadersPagination$.value = {page: 1, rowsPerPage: 1}
	reqBodyType$.value = ReqBodyType.NONE
	reqBody$.value = null
	reqBodyFormTextMode$.value = false
	reqBodyFormTextValue$.value = ''
	reqBodyFormPagination$.value = {page: 1, rowsPerPage: 1}
	reqBodyFileAccept$.value = '*/*'
	reqOptions$.value = new ReqOptions()
	fetching$.value = false
}

// #endregion

const
	SIDENAV_BP = 1_800,

	title$ = useTitle(() => 'URL Artisan' + (reqUrlValid$.value ? `: ${
		decodeURI(toUnicode(new URL(
			AppService.resolveUrl(reqUrl$.value)
		).hostname))
	}` : ''))

function handlePasteCurl(event: ClipboardEvent) {
	const text = event.clipboardData?.getData('text')
	console.log(text)
	// if (text)
	// 	event.preventDefault()
}

function send(command?: 'download' | 'repeat') {
	fetching$.value = true
}

// #region - TODO: remove mock

reqUrl$.value = 'https://chatgpt.com/?temporary-chat=true'
reqHeaders$.value = Array(500).fill(null).map(() => ({
	disable: Math.random() > 0.5,
	key: randomString(80),
	value: randomString(80),
}))
reqOptions$.value!.curlProxy.server.value = AppService.resolveUrl('/')

function randomString(bytes: number) {
	let result = ''
	while (result.length < bytes)
		result += new TextDecoder('ibm866')
			.decode(crypto.getRandomValues(new Uint8Array(bytes)))
			.replace(/\s/g, '')
	return result.slice(0, bytes)
}

// #endregion

/** TODO:

AppState class => req / ui composables, syncRef
qr
https://quasar.dev/vue-components/table#keyboard-navigation

min 320x320
tabs: "(3..2..1) tab closed. undo?", prepend width method if not GET; fetching is parallel; replace state on sync, add on open, find or create tab on nav, QSpinnerDots
[accesskey] & keyboard shortcuts menu item, keyboard flow (next on enter)
fullscreenable: https://vueuse.org/core/useFullscreen/
confirm page reload
copy: https://vueuse.org/core/useClipboard/
cookies: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#notes
header from body (application/x-www-form-urlencoded, JS, JSON, XML)
cache: no-store

web api
https://vueuse.org/core/useWebWorkerFn/
https://vueuse.org/core/useNetwork/
https://vueuse.org/core/useFetch/

reactivity
https://vueuse.org/shared/refDefault/ (model)

other
https://vueuse.org/shared/useTimeout/
https://vueuse.org/core/useTimestamp/
https://vueuse.org/core/useMagicKeys/
https://vueuse.org/core/onClickOutside/ (tooltip)
https://vueuse.org/core/useMouseInElement/ (tooltip)
https://vueuse.org/core/useTransition/ (text)
https://vueuse.org/core/useVModel/ (deep)

*/

</script>
