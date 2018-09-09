<template>
<section style="height:100%">
  <header id='portfolio-header'>
    <div class="portfolio-header-content">
      <img class="logo" src="../../assets/vpicon.png" alt="logo">
      <h1>{{ 'Vitalii Prots' }}</h1>
      <span>{{ 'Front-End Developer' }}</span>
    </div>
  </header>
  <footer id="portfolio-footer">
    <ul class="portfolio-footer-content">
      <li v-for='(item, key) in items' :key='key'>
        <a :href="item.herf" target="_blank">
          <img :src="item.icon" :alt="item.alt">
        </a>
      </li>
    </ul>
  </footer>
</section>
</template>
<script src='./index.js'></script>
<style lang="scss" src='./index.scss'></style>
