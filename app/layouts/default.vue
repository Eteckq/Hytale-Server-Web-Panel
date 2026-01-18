<template>
    <div class="flex h-screen">
        <nav class="bg-gray-800 p-4">
            <!-- Top -->
            <div class="text-center w-36">
                Hytale Panel
            </div>
            <Menu :model="items" />
        </nav>
        <div class="bg-gray-900 w-full p-8">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const items = ref([
    {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        to: '/',
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        to: '/settings',
    },
])
</script>