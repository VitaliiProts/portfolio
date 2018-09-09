<template>
  <Content />
</template>

<script>
import Content from './components/content/Content.vue';

export default {
  components: { Content }
}

</script>

<style lang="scss">
body, html {
  font-family: "Helvetica", "Arial", sans-serif;
  background-color: #000;
  color: #fff;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

ul, li {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

</style>
