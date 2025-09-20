<template>
  <div>
    <h1>Books with ISBN > 1000</h1>

    <ul v-if="books.length">
      <li v-for="book in books" :key="book.id">
        {{ book.name }} - ISBN: {{ book.isbn }}
      </li>
    </ul>
    <p v-else class="text-muted">No data</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import db from '@/firebase/init'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default {
  name: 'BookList',
  setup() {
    const books = ref([])

    const fetchBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('isbn', '>', 1000))
        const snap = await getDocs(q)
        const arr = []
        snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }))
        books.value = arr
      } catch (err) {
        console.error('Error fetching books: ', err)
      }
    }

    onMounted(fetchBooks)

    return { books }
  }
}
</script>
