<template>
    <div class="flex flex-col items-center justify-center h-screen gap-4">
        <InputText @keyup.enter="login" type="password" v-model="password" />
        <Button @click="login" :loading="isLoading">Access</Button>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    layout: 'unauth',
})


const password = ref('')
const authStore = useAuthStore()

const isLoading = ref(false)

onMounted(() => {
    if (authStore.token) {
        navigateTo('/')
    }
})
const login = async () => {
    isLoading.value = true
    const success = await authStore.login(password.value)
    if (success) {
        navigateTo('/')
    } else {
        console.error('Login failed')
    }
    isLoading.value = false
}
</script>