import Vue from 'vue'
import Router from 'vue-router'
// import Upload from '@/components/upload/Upload'

Vue.use(Router)

// 解决那啥的报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}


export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: ()=>import('../pages/Home/Home')
    },
    {
      path: '/login',
      name: 'Login',
      component: ()=>import('../pages/Login/Login')
    },
    {
      path: '/article',
      name: 'Artical',
      component: ()=>import('../pages/Artical/Artical')
    },
    {
      path: '/userInfo',
      name: 'UserInfo',
      component: ()=>import('../pages/UserInfo/UserInfo')

    },
    {
      path: '/writeArtical',
      name: 'WriteArtical',
      component: ()=>import('../pages/writeArtical/WriteArtical')
    },
    {
      path: '/*',
      redirect: '/'
    }
  ],
  scrollBehavior: (to, from, savePosition) => {
    // 如果savePosition存在，则直接滚动到相应位置
    if (savePosition) {
      return savePosition
    }
    // 否则直接回到顶部
    return {x: 0, y: 0}
   },
})
