<template>
    <div>
        <div v-if="pending != true && data != undefined">
            {{ data }}
        </div>
    </div>
</template>

<script setup lang="ts">
    const { data, refresh, pending } = await useApi('/api/backups/backups', { immediate: false })
    onMounted(() => {
        refresh()
    })
</script>