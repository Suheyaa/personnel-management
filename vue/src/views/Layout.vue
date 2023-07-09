<template>
  <div>
    <!--  头部区域  -->
    <div class="head" >
      <div style="width: 300px">
        <img class="logo" src="@/assets/logo.png" alt="">
        <span class="title">人员管理系统</span>
      </div>
      <div class="personal-center">
        <el-dropdown size="medium">
          <span class="el-dropdown-link" style="cursor: pointer">
            {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" style="margin-top: -5px">
            <el-dropdown-item><div style="width: 50px; text-align: center;" @click="logout">退出</div></el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!--   侧边栏和主体 -->
    <div class="body">
      <!--      侧边栏导航-->
      <div class="navigation">
        <el-menu :default-active="$route.path"  router class="el-menu-demo">
          <!--          index 填的是 router的path，点击后切换路由-->
          <el-menu-item index="/">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>
          <el-submenu index="user">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user">用户列表</el-menu-item>
          </el-submenu>
          <el-submenu index="role">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>角色管理</span>
            </template>
            <el-menu-item index="/role">角色列表</el-menu-item>
          </el-submenu>
          <el-submenu index="post">
            <template slot="title">
              <i class="el-icon-question"></i>
              <span>岗位管理</span>
            </template>
            <el-menu-item index="/post">岗位列表</el-menu-item>
          </el-submenu>

          <el-submenu index="dept">
            <template slot="title">
              <i class="el-icon-connection"></i>
              <span>部门管理</span>
            </template>
            <el-menu-item index="/dept">部门列表</el-menu-item>
          </el-submenu>

          <el-menu-item index="business">
            <template slot="title" index="business">
              <i class="el-icon-s-unfold"></i>
              <span>系统管理</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>
      <!--   主体数据   -->
      <div class="main-data">
<!--        显示的是子路由的页面-->
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Layout",
  data(){
    return{
      username:"yhz",
    }
  },
  methods:{
    logout() {
      // 清除浏览器用户数据
      window.location.href="https://www.baidu.com/"
    }
  }
}
</script>

<style scoped>
.head{
  height: 60px;
  line-height: 60px;
  background-color: white;
  margin-bottom: 2px;
  display: flex;
}
.logo{
  width: 40px;
  position: relative;
  top: 10px;
  left: 20px;
}
.title{
  margin-left: 25px;
  font-size: 24px;
}

.body{
  display: flex;
}
.navigation{
  width: 200px;
  overflow: hidden;
  margin-right: 2px;
  background-color: white;
  min-height: calc(100vh - 62px);
}
.main-data{
  flex: 1;
  background-color:white;
  padding: 10px;
}
.personal-center{
  flex: 1;
  text-align: right;
  padding-right: 20px
}
</style>