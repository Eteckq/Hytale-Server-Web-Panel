<template>
    <div>
        <div v-if="pending != true && data != undefined">
            <div class="flex flex-col gap-2">
                <h1>World Data</h1>
                <div v-for="file in data.data" :key="file">
                    {{ file }}
                </div>
                <h1>Backups</h1>
                <div v-for="file in data.backups" :key="file">
                    {{ file }}
                </div>
                <h1>Server</h1>
                <div v-for="file in data.server" :key="file">
                    {{ file }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    const { data, refresh, pending } = await useApi('/api/file/file')
    onMounted(() => {
        refresh()
    })
</script>