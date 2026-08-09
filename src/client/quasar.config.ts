import {defineConfig} from '#q-app'

/** https://v2.quasar.dev/quasar-cli-vite/quasar-config-file */
export default defineConfig(ctx => {
	return {
		css: [
			'app.scss',
			'fonts.scss',
			'quasar.overrides.scss',
		],
		extras: [
			'mdi-v7',
		],
		framework: {
			iconSet: 'mdi-v7',
			plugins: ['Dialog', 'Notify'],
		},
		devServer: {
			host: '0.0.0.0',
			port: (ctx.mode as any).pwa ? 2035 : 2034,
			open: false
		},
		build: {
			allowOutsideProjectDistDir: true,
			distDir: '../../dist/url-artisan',
			publicPath: '/url-artisan',
			vueRouterMode: 'hash',
			useFilenameHashes: false,
			typescript: {
				strict: true,
				vueShim: false,
			},
			// TODO: infer final target
			// ['es2022', 'firefox115', 'chrome115', 'safari14']
			// target: {
			// 	browser: 'baseline-widely-available',
			// },
		},
		// TODO: extend to PWA
		// https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
		// pwa: {
		// 	workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
		// 	swFilename: 'sw.js',
		// 	manifestFilename: 'manifest.json',
		// 	extendPWAManifestJson (json) {},
		// 	useCredentialsForManifestTag: true,
		// 	injectPWAMetaTags: false,
		// 	extendPWACustomSWConf (rolldownConf) {},
		// 	extendPWAGenerateSWOptions (cfg) {},
		// 	extendPWAInjectManifestOptions (cfg) {},
		// 	extendPWASwTsConfig (tsConfig) {}
		// },
	}
})
