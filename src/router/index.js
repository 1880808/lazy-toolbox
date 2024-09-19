import { createWebHashHistory, createRouter } from 'vue-router'
import Login from '../renderer/src/pages/login/login.vue'

const routes = [
    { path: '/', component: Login },
    { path: '/build', component: () => import('../renderer/src/pages/build/index.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

// router.beforeEach((to, from, next) => {
//     next()
// })


export default router
