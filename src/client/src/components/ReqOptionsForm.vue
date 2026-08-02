<template>
<div class="artisan-req-options-form">
	<q-list class="non-selectable">
		<menu-item
			class="q-pa-toolbar"
			icon="mdi-account-key-outline"
			label="Send Credentials"
			caption="Include cookies, TLS client certificates, Authorization and Proxy-Authorization headers"
			use-label
		>
			<q-checkbox inert v-model="options$.includeCredentials.value" color="text"/>
		</menu-item>
		<menu-item
			class="q-pa-toolbar"
			icon="mdi-directions-fork"
			label="Follow Redirects"
			caption="Automatically follow 3xx responses"
			use-label
		>
			<q-checkbox inert v-model="options$.followRedirects.value" color="text"/>
		</menu-item>
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
			<div class="q-pa-toolbar">
				Extra URLs (raw autogrow) & fastest (checkbox)<br>
				Method, status code & text (3 inputs)<br>
				Retry options w/preview (2x2 inputs)<br>
				Timeout & ttfb (2 inputs)<br>
				Throttle (2 inputs) & presets (menu)<br>
				Ren res headers (checkbox) & skip defaults (checkbox)<br>
				`*headers`<br>
				Body<br>
				`resbody`
			</div>
		</q-expansion-item>
	</q-list>
</div>
</template>

<style scoped lang="scss">
.list-item-input :deep(.q-field__control-container) {
	margin-inline: 26px 10px;
}
</style>

<script setup lang="ts">
import {MenuItem, type ReqOptions} from '@'

const options$ = defineModel<ReqOptions>({required: true})
</script>
