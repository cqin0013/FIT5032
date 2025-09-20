<script setup>
import LibraryRegistrationForm from '../components/LibraryRegistrationForm.vue'
import Rating from '../components/Rating.vue'
</script>

<template>
  <div class="container py-4">
    <section class="mb-4">
      <h3 class="mb-3">Rate</h3>
      <Rating itemId="book-1" />
    </section>

    <hr class="my-4" />

    <section>
      <h3 class="mb-3">Library Registration Form</h3>
      <LibraryRegistrationForm />
    </section>
  </div>
</template>
