<script setup>
import BHeader from './components/BHeader.vue'
</script>

<template>
  <div class="app">

    <BHeader />


    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style>
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
