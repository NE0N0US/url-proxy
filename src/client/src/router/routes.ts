import type {RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
	// {
	// 	path: '/',
	// 	component: () => import('@/layouts/MainLayout.vue'),
	// 	children: [
	// 		{ path: '', component: () => import('@/pages/IndexPage.vue') },
	// 	],
	// },
	// TODO: decide if router meets app requirements:
	// $route = useRoute() // params.catchAll array
	// router = useRouter() // replace(Partial<route>)
	// https://vueuse.org/core/useBrowserLocation/
	// https://vueuse.org/core/useUrlSearchParams/
	{
		path: '/:catchAll(.*)*',
		component: () => import('@/layouts/MainLayout.vue'),
	},
]

export default routes
