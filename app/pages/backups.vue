<template>
    <div>
        <h2>Backups</h2>
        <Button label="Create a manual backup" />
        <div v-if="pending != true && data != undefined">
            <div v-for="backup in data.backups">
                {{ backup }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { data, refresh, pending } = await useApi('/api/backups/backups', { immediate: false })
onMounted(() => {
    refresh()
})
</script>