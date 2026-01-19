<template>
    <HeaderInfo :data="data" />
    <ActionButtons :running="data?.status.running" @refresh="refresh" />
    <Console @executeCommand="execute" />
    <CommandLine :running="data?.status.running" @execute="execute" />
</template>

<script setup lang="ts">


const panelResponse = await useApi('/api/panel', { immediate: false })
const { data, refresh, pending } = panelResponse

onMounted(() => {
    refresh()
})


const execute = async (command: string) => {
    await fetch('/api/server/execute', {
        method: 'POST',
        body: JSON.stringify({ command: command }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
</script>