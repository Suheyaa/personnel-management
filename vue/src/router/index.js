import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Layout from '../views/Layout.vue'

Vue.use(VueRouter)

const routes = [

  {
    path: '/',
    name: 'Layout',
    component: Layout,
    redirect: '/home',
    children:[
      {
        path: 'home',
        name: 'Home',
        component: ()=> import('../views/HomeView.vue')
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/User.vue')
      },
      {
        path: 'post',
        name: 'Post',
        component: ()=> import('../views/post/Post.vue')
      }
    ]
  },


]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
