<script setup>
import BHeader from './components/BHeader.vue'
</script>

<template>
  <a href="#main"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-yellow-200 px-2 py-1 rounded">
    Skip to main content
  </a>
  <div class="app">

    <BHeader />


    <main id="main" class="content" tabindex="-1">
      <router-view />
    </main>
  </div>
</template>

<style>
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 1rem;
}
</style>
