<template>
<div class="artisan-req-options-form relative-position">
	<q-list class="non-selectable">
		<req-options-form-toggle
			icon="mdi-account-key-outline"
			label="Send Credentials"
			caption="Include cookies, TLS client certificates, Authorization and Proxy-Authorization headers"
			v-model="options$.includeCredentials"
		/>
		<req-options-form-toggle
			icon="mdi-directions-fork"
			label="Follow Redirects"
			caption="Automatically follow 3xx responses"
			v-model="options$.followRedirects"
		/>
	</q-list>
	<q-input
		class="list-item-input q-pa-toolbar"
		spellcheck="false" autocomplete="off"
		label="SRI Hashes"
		:shadow-text="options$.integrityHashes.value ? ' ' : 'sha512-<base64_digest> (space-separated)'"
		v-model="options$.integrityHashes.value"
		:disable="!!(options$.integrityHashes.value && options$.integrityHashes.disable)"
		borderless hide-bottom-space dense
		input-class="artisan-mono"
	>
		<template #prepend>
			<q-icon name="mdi-fingerprint" color="text"/>
		</template>
		<template #after>
			<q-checkbox
				v-if="options$.integrityHashes.value"
				v-model="options$.integrityHashes.disable"
				:true-value="false" :false-value="true"
				color="text"
			/>
		</template>
	</q-input>
	<q-input
		class="list-item-input q-pa-toolbar"
		spellcheck="false" autocomplete="off"
		label="cURL Proxy Server"
		:shadow-text="options$.curlProxy.server.value ? ' ' : 'https://curl-proxy.vercel.app/'"
		v-model="options$.curlProxy.server.value"
		:disable="!!(options$.curlProxy.server.value && options$.curlProxy.server.disable)"
		borderless hide-bottom-space dense
		input-class="artisan-mono"
	>
		<template #prepend>
			<q-icon name="mdi-server-network-outline" color="text"/>
		</template>
		<template #after>
			<q-checkbox
				v-if="options$.curlProxy.server.value"
				v-model="options$.curlProxy.server.disable"
				:true-value="false" :false-value="true"
				color="text"
			/>
		</template>
	</q-input>
	<q-list class="non-selectable">
		<q-expansion-item
			:model-value="!!options$.curlProxy.server.value && !options$.curlProxy.server.disable"
			header-class="hidden"
		>
			<q-separator/>
			<q-input
				class="list-item-input q-pa-toolbar"
				spellcheck="false" autocomplete="off"
				label="URLs"
				:shadow-text="options$.curlProxy.urls.value ? ' ' : 'Newline-separated URLs (full, protocol-less, or relative)'"
				autogrow
				v-model="options$.curlProxy.urls.value"
				:disable="!!(options$.curlProxy.urls.value && options$.curlProxy.urls.disable)"
				borderless hide-bottom-space dense
				input-class="artisan-mono"
			>
				<template #prepend>
					<q-icon name="mdi-link-variant-plus" color="text"/>
				</template>
				<template #after>
					<q-checkbox
						v-if="options$.curlProxy.urls.value"
						v-model="options$.curlProxy.urls.disable"
						:true-value="false" :false-value="true"
						color="text"
					/>
				</template>
			</q-input>
			<q-list class="non-selectable">
				<req-options-form-toggle
					icon="mdi-lightning-bolt"
					label="Fastest"
					:caption="'Return first available response and its index in \x22X-Proxy-Responses\x22, abort others'"
					:disable="!options$.curlProxy.urls.value || options$.curlProxy.urls.disable"
					v-model="options$.curlProxy.fastest"
				/>
			</q-list>
			<div v-for="group, index of PROXY_OPTIONS" :key="index" class="proxy-options">
				<q-input
					v-for="{name, digits, icon, label, caption} of group" :key="name"
					class="list-item-input"
					spellcheck="false" autocomplete="off"
					:inputmode="digits ? 'numeric' : undefined"
					:label="label"
					:shadow-text="(<any>options$.curlProxy)[name] ? ' ' : caption"
					:mask="digits ? numericMask(digits) : undefined"
					reverse-fill-mask
					unmasked-value
					v-model="(<any>options$.curlProxy)[name]"
					:maxlength="digits ? numericMask(digits).length : undefined"
					borderless hide-bottom-space dense
				>
					<template #prepend>
						<q-icon :name="icon" color="text"/>
					</template>
				</q-input>
			</div>
			<q-separator/>
			<q-tabs
				breakpoint="0"
				mobile-arrows
				align="left" narrow-indicator
				inline-label no-caps
				v-model="options$.curlProxy.headersTab"
			>
				<q-tab
					icon="mdi-table"
					label="Headers"
					name="headers"
					:ripple="ripple$"
				/>
				<q-tab
					icon="mdi-table-minus"
					label="Delete Headers"
					name="delHeaders"
					:ripple="ripple$"
				/>
				<q-tab
					icon="mdi-table"
					label="Response Headers"
					name="resHeaders"
					:ripple="ripple$"
				/>
				<q-tab
					icon="mdi-table-minus"
					label="Delete Response Headers"
					name="delResHeaders"
					:ripple="ripple$"
				/>
			</q-tabs>
			<q-separator/>
			<div
				class="row no-wrap"
				:style="{width: Object.keys(options$.curlProxy.headersAll).length * 100 + '%'}"
			>
				<req-kv-table
					v-for="table, _key, index of options$.curlProxy.headersAll" :key="table.name"
					class="full-width relative-position"
					:class="{invisible: options$.curlProxy.headersTab !== table.name}"
					:style="{
						'max-width': 100 / Object.keys(options$.curlProxy.headersAll).length + '%',
						right: index * 100 / Object.keys(options$.curlProxy.headersAll).length + '%',
					}"
					:hide-columns="table.deleteMode ? 'value' : undefined"
					:table-height="tableHeight - 48"
					v-model:text-mode="table.textMode"
					v-model:text-value="table.textValue"
					v-model="table.rows"
					v-model:pagination="table.pagination"
				/>
			</div>
			<q-separator/>
			<q-list class="non-selectable">
				<req-options-form-toggle
					icon="mdi-rename-outline"
					label="Rename Response Headers"
					:caption="'To \x22X-Original-*\x22 before changes'"
					v-model="options$.curlProxy.renameResponseHeaders"
				/>
				<req-options-form-toggle
					icon="mdi-skip-forward"
					label="Skip Defaults"
					caption="Do not apply default header changes, except response safety behavior"
					v-model="options$.curlProxy.skipDefaults"
				/>
			</q-list>
			<div class="proxy-options">
				<!-- .5 - workaround for fractional width: https://stackoverflow.com/q/39861687 -->
				<http-method-field
					:offset-x="12.5"
					placeholder="Override"
					v-model="options$.curlProxy.method"
				/>
			</div>
		</q-expansion-item>
	</q-list>
	<div class="absolute-full no-pointer-events">
		<q-resize-observer debounce="0" @resize="height$ = $event.height"/>
	</div>
</div>
</template>

<style scoped lang="scss">
.list-item-input, .artisan-http-method-field {
	:deep(.q-field__control-container) {
		margin-inline: 26px 10px;
	}
}

.proxy-options {
	display: flex;
	flex-wrap: nowrap;

	& > * {
		flex: 1 1 min-content;
		padding: 4px 6px;

		&:first-child {
			padding-left: 12px;
		}

		&:last-child {
			padding-right: 12px;
		}
	}

	.artisan-http-method-field {
		padding: 0;

		& > :deep(*) {
			padding: 4px 12px;
		}
	}
}
</style>

<script setup lang="ts">
import {ref} from 'vue'
import {AppState, HttpMethodField, ReqKvTable, ReqOptionsFormToggle, type ReqOptions} from '@'

const
	{ripple$} = AppState,

	height$ = ref(0),

	$props = defineProps<{
		tableHeight: number,
	}>(),

	options$ = defineModel<ReqOptions>({required: true}),

	PROXY_OPTIONS = Object.freeze([
		[
			{name: 'retry', digits: 16, icon: 'mdi-reload', label: 'Retries', caption: 'Count after first request'},
			{name: 'retryIn', digits: 16, icon: 'mdi-timer-outline', label: 'Interval, ms', caption: 'Between retries'},
		],
		[
			{name: 'retryFactor', digits: 16, icon: 'mdi-chart-line-variant', label: 'Backoff Multiplier', caption: 'Per retry'},
			{name: 'retryLimit', digits: 16, icon: 'mdi-timer-lock-outline', label: 'Backoff Limit, ms', caption: 'Max. retry interval'},
		],
		[
			{name: 'timeout', digits: 16, icon: 'mdi-clock-remove-outline', label: 'Timeout, ms', caption: 'Abort request after'},
			{name: 'ttfb', digits: 16, icon: 'mdi-timer-sand', label: 'TTFB, ms', caption: 'Time to first byte'},
		],
		[
			{name: 'throttle', digits: 16, icon: 'mdi-speedometer-medium', label: 'Throttle Both, kbit/s', caption: 'Bidirectional bandwidth limit'},
			{name: 'throttleUp', digits: 16, icon: 'mdi-speedometer-slow', label: 'Throttle Upload, kbit/s', caption: 'Upload bandwidth limit'},
		],
		[
			{name: 'status', digits: 3, icon: 'mdi-numeric', label: 'Status', caption: 'Response status code'},
			{name: 'statusText', icon: 'mdi-message-text-outline', label: 'Status Text', caption: 'Response status message'},
		],
	])

function numericMask(digits: number) {
	let mask = '#'
	for (let c = 1; c < digits; c++)
		mask = (c % 3 ? '#' : '# ') + mask
	return mask
}
</script>
