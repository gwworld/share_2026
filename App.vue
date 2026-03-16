<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-header style="background: #409EFF; color: white; display: flex; align-items: center; padding: 0 20px">
        <h2 style="margin: 0">DRC Rule Table Management System</h2>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          background-color="#409EFF"
          text-color="white"
          active-text-color="#ffd04b"
          style="flex: 1; border: none; margin-left: 50px"
          @select="handleMenuSelect"
        >
          <el-menu-item index="rules">Rules</el-menu-item>
          <el-menu-item index="templates">Templates</el-menu-item>
          <el-menu-item index="layers">Layers</el-menu-item>
        </el-menu>
      </el-header>
      <el-main style="padding: 20px">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      activeMenu: 'rules'
    };
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
      this.$router.push('/' + index);
    }
  },
  mounted() {
    const path = this.$route.path.replace('/', '');
    if (path) {
      this.activeMenu = path;
    }
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  height: 100vh;
}
</style>
