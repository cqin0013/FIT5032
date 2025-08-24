<template>
    <div class="container mt-5">
        <div class="row">
            <div class="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto">
                <h1 class="text-center mb-3">User Information Form</h1>

                <form @submit.prevent="submitForm">
                    <div class="row mb-3">
                        <div class="col-6">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" v-model="formData.username"
                                @blur="() => validateName(true)" @input="() => validateName(false)" />
                            <div v-if="errors.username" class="text-danger mt-1">{{ errors.username }}</div>
                        </div>

                        <div class="col-6">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" v-model="formData.password"
                                @blur="() => validatePassword(true)" @input="() => validatePassword(false)" />
                            <div v-if="errors.password" class="text-danger mt-1">{{ errors.password }}</div>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isAustralian"
                                    v-model="formData.isAustralian" @change="() => validateResident(true)" />
                                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
                            </div>
                            <div v-if="errors.resident" class="text-danger mt-1">{{ errors.resident }}</div>
                        </div>

                        <div class="col-6">
                            <label for="gender" class="form-label">Gender</label>
                            <select class="form-select" id="gender" v-model="formData.gender"
                                @blur="() => validateGender(true)" @change="() => validateGender(false)">
                                <option value="">Select one…</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                            <div v-if="errors.gender" class="text-danger mt-1">{{ errors.gender }}</div>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="reason" class="form-label">Reason for joining</label>
                        <textarea class="form-control" id="reason" rows="3" v-model="formData.reason"
                            @blur="() => validateReason(true)" @input="() => validateReason(false)"></textarea>
                        <div v-if="errors.reason" class="text-danger mt-1">{{ errors.reason }}</div>
                    </div>

                    <div class="d-grid gap-2 d-sm-flex justify-content-center">
                        <button type="submit" class="btn btn-primary me-sm-2">Submit</button>
                        <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
                    </div>
                </form>

                <!-- PrimeVue DataTable：提交后展示 -->
                <div class="mt-5" v-if="submittedCards.length">
                    <h2 class="h5 mb-3">Submitted Users (PrimeVue DataTable)</h2>

                    <DataTable :value="submittedCards" :paginator="true" :rows="5" tableStyle="min-width: 48rem">
                        <Column field="username" header="Username" sortable />
                        <Column field="password" header="Password" />
                        <Column header="Australian Resident">
                            <template #body="{ data }">
                                {{ data.isAustralian ? 'Yes' : 'No' }}
                            </template>
                        </Column>
                        <Column field="gender" header="Gender" sortable />
                        <Column field="reason" header="Reason" />
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
})

const errors = ref({
    username: null,
    password: null,
    resident: null,
    gender: null,
    reason: null
})

const validateName = (blur = false) => {
    const v = formData.value.username.trim()
    let msg = null
    if (v.length < 3) msg = 'Name must be at least 3 characters'
    if (blur || msg === null) errors.value.username = msg
}

const validatePassword = (blur = false) => {
    const p = formData.value.password
    const minLength = 8
    const hasUpper = /[A-Z]/.test(p)
    const hasLower = /[a-z]/.test(p)
    const hasNumber = /\d/.test(p)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p)
    let msg = null
    if (p.length < minLength) msg = `Password must be at least ${minLength} characters`
    else if (!hasUpper) msg = 'At least one uppercase letter required'
    else if (!hasLower) msg = 'At least one lowercase letter required'
    else if (!hasNumber) msg = 'At least one number required'
    else if (!hasSpecial) msg = 'At least one special character required'
    if (blur || msg === null) errors.value.password = msg
}

const validateGender = (blur = false) => {
    let msg = null
    if (!formData.value.gender) msg = 'Please select a gender'
    if (blur || msg === null) errors.value.gender = msg
}

const validateReason = (blur = false) => {
    const r = formData.value.reason.trim()
    let msg = null
    if (r.length < 10) msg = 'Reason must be at least 10 characters'
    if (blur || msg === null) errors.value.reason = msg
}

const validateResident = (blur = false) => {
    let msg = null
    if (!formData.value.isAustralian) msg = 'Please confirm residency'
    if (blur || msg === null) errors.value.resident = msg
}

const submittedCards = ref([])

const submitForm = () => {
    validateName(true)
    validatePassword(true)
    validateGender(true)
    validateReason(true)
    validateResident(true)

    const ok = Object.values(errors.value).every(v => !v)
    if (!ok) return

    submittedCards.value.push({ ...formData.value })
}

const clearForm = () => {
    Object.assign(formData.value, {
        username: '',
        password: '',
        isAustralian: false,
        reason: '',
        gender: ''
    })
    Object.keys(errors.value).forEach(k => (errors.value[k] = null))
}
</script>

<style scoped>
.card {
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
    background-color: #275FDA;
    color: white;
    padding: 10px;
    border-radius: 10px 10px 0 0;
}

.list-group-item {
    padding: 10px;
}
</style>
