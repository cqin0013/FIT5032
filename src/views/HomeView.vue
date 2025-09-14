<script setup>
import LibraryRegistrationForm from '../components/LibraryRegistrationForm.vue'
import Rating from "../components/Rating.vue";
</script>

<template>
  <LibraryRegistrationForm />

  <div class="container">
    <h2>Library Registration Form</h2>
    <LibraryRegistrationForm />
    <hr />
    <h3>Rate</h3>
    <Rating itemId="book-1" />
  </div>
</template>
