<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../stores/auth'

const router = useRouter()
const route = useRoute()

const form = ref({ username: '', password: '' })
const error = ref(null)
const loading = ref(false)

const onSubmit = async () => {
  error.value = null
  loading.value = true
  const ok = login(form.value.username.trim(), form.value.password)
  loading.value = false

  if (ok) {
    // go to intended page or About by default
    const to = route.query.redirect || '/about'
    router.push(to)
  } else {
    error.value = 'Invalid username or password.'
  }
}
</script>

<template>
  <div class="container my-4" style="max-width: 480px">
    <h1 class="h3 mb-3">Login</h1>

    <form @submit.prevent="onSubmit">
      <div class="mb-3">
        <label class="form-label" for="u">Username</label>
        <input id="u" class="form-control" v-model="form.username" autocomplete="username" />
      </div>
      <div class="mb-3">
        <label class="form-label" for="p">Password</label>
        <input id="p" type="password" class="form-control" v-model="form.password" autocomplete="current-password" />
      </div>

      <div v-if="error" class="text-danger mb-3">{{ error }}</div>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Login' }}
      </button>

      <p class="text-muted mt-3">
        Demo credentials: <code>student</code> / <code>fit5032</code>
      </p>
    </form>
  </div>
</template>
