<template>
<q-list class="app-color-settings-presets non-selectable">
	<menu-item
		v-for="{icon, label, caption, colors} of scheme === 'light' ? PRESETS_LIGHT : PRESETS_DARK" :key="label"
		:icon="icon" :label="label" :caption="caption"
		@click.passive="preset$ = colors"
	>
		<q-icon v-if="deepEqual(colors, preset$)" name="mdi-check" color="text"/>
	</menu-item>
</q-list>
</template>

<script setup lang="ts">
import {is} from 'quasar'
const {deepEqual} = is
import {AppService, MenuItem} from '@'

const
	$props = defineProps<{
		scheme: string,
	}>(),

	preset$ = defineModel<string[]>({required: true}),

	PRESETS_LIGHT = AppService.freeze([
		// https://github.com/76784/Daobeam#comparison-of-biege-background-usages
		{icon: 'mdi-weather-sunny', label: 'Light', caption: 'Warm low-contrast', colors: [
			'#e0dbc7', '#171717', '#0000e4',
			'#bd00be', '#d60061', '#b45800',
		]},
		{icon: 'mdi-brightness-7', label: 'White', caption: 'Bright high-contrast', colors: [
			'#ffffff', '#000000', '#00aaff',
			'#c000c2', '#d90062', '#b65a00',
		]},
	]),

	PRESETS_DARK = AppService.freeze([
		// https://apcacontrast.com/
		{icon: 'mdi-weather-night', label: 'Dark', caption: 'Blue-gray low-contrast', colors: [
			'#1a1d2b', '#dcdcdc', '#dea81e',
			'#fc94f9', '#fd88a3', '#fcaa75',
		]},
		{icon: 'mdi-circle-half-full', label: 'Gray', caption: 'Neutral low-contrast', colors: [
			'#1e1e1e', '#dcdcdc', '#de666b',
			'#de6fdc', '#df6685', '#de8b55',
		]},
		{icon: 'mdi-brightness-4', label: 'Black', caption: 'AMOLED high-contrast', colors: [
			'#000000', '#ffffff', '#fe7000',
			'#ff6cfd', '#ff618e', '#ff974f',
		]},
	])
</script>
