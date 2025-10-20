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
      <section class="hero card">
        <h1 class="hero-title">You’re not alone.</h1>
        <p class="hero-sub">
          Track your mood, explore self-help resources, and find nearby support tailored for youth.
        </p>
      </section>

      <router-view />
    </main>

    <footer class="site-footer">
      <div class="container">
        <small>© 2025 Youth Mental Health Hub · This site is for education & information only.</small>
      </div>
    </footer>
  </div>
</template>

<style>
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.app { min-height: 100vh; display: flex; flex-direction: column; }
.content { flex: 1; padding: 1rem; }
.hero { margin: 1rem auto 1.2rem; text-align: center; }
.hero-title { margin: .2rem 0 .4rem; font-size: 1.6rem; }
.hero-sub { margin: 0 auto; max-width: 750px; color: var(--ymh-muted); }
.site-footer { padding: 1rem 0; color: var(--ymh-muted); }
</style>
