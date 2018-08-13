<template>
  <div id="app">
    <Header />
    <Footer />
  </div>
</template>

<script>
import Header from './components/header/Header.vue';
import Footer from './components/footer/Footer.vue';

export default {
  name: 'app',
  components: {
    Header,
    Footer
  }
}
</script>

<style lang="scss">
body {
  background-color: #000;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  color: #fff;
}

</style>
