<template>
  <div style="max-width:520px;margin:2rem auto;">
    <h1>Add Book</h1>

    <form @submit.prevent="addBook">
      <div class="mb-3">
        <label for="isbn">ISBN:</label>
        <!--v-model.number -->
        <input id="isbn" type="number" v-model.number="isbn" required min="0" class="form-control" />
      </div>

      <div class="mb-3">
        <label for="name">Name:</label>
        <input id="name" type="text" v-model.trim="name" required maxlength="120" class="form-control" />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Saving…' : 'Add Book' }}
      </button>

      <p class="mt-3 text-success" v-if="ok">{{ ok }}</p>
      <p class="mt-3 text-danger" v-if="err">{{ err }}</p>
    </form>

    <hr class="my-4" />
    <!-- 8.5-->
    <BookList />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import db from '@/firebase/init'                         
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import BookList from '@/components/BookList.vue'

const isbn = ref(null)
const name = ref('')
const loading = ref(false)
const ok = ref('')
const err = ref('')

const addBook = async () => {
  ok.value = ''; err.value = ''; loading.value = true
  try {
    const isbnNumber = Number(isbn.value)
    if (Number.isNaN(isbnNumber)) {
      alert('ISBN must be a valid number')
      loading.value = false
      return
    }
    await addDoc(collection(db, 'books'), {
      isbn: isbnNumber,              
      name: name.value,
      createdAt: serverTimestamp()
    })
    ok.value = ' Book added successfully!'
    isbn.value = null
    name.value = ''
  } catch (e) {
    console.error(e)
    err.value = ' Error adding book'
  } finally {
    loading.value = false
  }
}
</script>
