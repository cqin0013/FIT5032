<!-- src/components/Form.vue -->
<template>
    <div class="container mt-5">
        <div class="row">
            <!--  -->
            <div class="col-12 col-sm-10 col-md-8 col-lg-6 mx-auto">
                <h1 class="text-center mb-3">User Information Form</h1>

                <!-- 表单 -->
                <form @submit.prevent="submitForm">
                    <!-- 第 1 行-->
                    <div class="row mb-3">
                        <div class="col-6">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username" v-model="formData.username"
                                required />
                        </div>

                        <div class="col-6">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" v-model="formData.password"
                                required />
                        </div>
                    </div>

                    <!-- 第 2 行-->
                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isAustralian"
                                    v-model="formData.isAustralian" />
                                <label class="form-check-label" for="isAustralian">
                                    Australian Resident?
                                </label>
                            </div>
                        </div>

                        <div class="col-6">
                            <label for="gender" class="form-label">Gender</label>
                            <select class="form-select" id="gender" v-model="formData.gender" required>
                                <option value="" disabled>Select one…</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <!-- 加入原因 -->
                    <div class="mb-3">
                        <label for="reason" class="form-label">Reason for joining</label>
                        <textarea class="form-control" id="reason" rows="3" v-model="formData.reason"></textarea>
                    </div>

                    <!-- 按钮 -->
                    <div class="d-grid gap-2 d-sm-flex justify-content-center">
                        <button type="submit" class="btn btn-primary me-sm-2">Submit</button>
                        <button type="button" class="btn btn-secondary" @click="clearForm">
                            Clear
                        </button>
                    </div>
                </form>

                <!-- 提交后用 Cards 展示 -->
                <div class="row mt-5" v-if="submittedCards.length">
                    <div class="d-flex flex-wrap justify-content-start">
                        <div v-for="(card, index) in submittedCards" :key="index" class="card m-2 w-100 w-sm-auto"
                            style="width: 18rem;">
                            <div class="card-header">User Information</div>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">Username: {{ card.username }}</li>
                                <li class="list-group-item">Password: {{ card.password }}</li>
                                <li class="list-group-item">
                                    Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
                                </li>
                                <li class="list-group-item">Gender: {{ card.gender }}</li>
                                <li class="list-group-item">Reason: {{ card.reason }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- /Cards -->
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

const submittedCards = ref([])

const submitForm = () => {
    // 复制当前数据推入卡片列表
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
