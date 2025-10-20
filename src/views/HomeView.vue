<script setup>
import Rating from '../components/Rating.vue'
import LibraryRegistrationForm from '../components/LibraryRegistrationForm.vue'
</script>

<template>
  <div class="container">
    <section class="card" style="margin-bottom: 16px;">
      <h2 class="mb-3">Daily Mood Check-in</h2>
      <p class="text-sm" style="color:var(--ymh-muted); margin-top:-6px; margin-bottom:10px;">
        How are you feeling today? Logging your mood helps you notice patterns over time.
      </p>
      <Rating itemId="mood-daily" />
    </section>

    <section class="card">
      <h2 class="mb-3">Join a Wellbeing Program</h2>
      <p class="text-sm" style="color:var(--ymh-muted); margin-top:-6px; margin-bottom:10px;">
        Sign up to receive school/community workshops, mindfulness sessions, or peer-support circles.
      </p>
      <LibraryRegistrationForm />
    </section>
  </div>
</template>

<style scoped>
.mb-3 { margin-bottom: .8rem; }
.text-sm { font-size: .92rem; }
</style>
