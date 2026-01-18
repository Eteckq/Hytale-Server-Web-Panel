<template>
    <section class="w-full bg-gray-800 p-4 rounded">
        <span :class="data?.status.running ? 'text-green-500' : 'text-red-500'" class="font-bold text-2xl">
            {{ data?.status.running ? 'Online' : 'Offline' }}
        </span>
    </section>
    <section class="w-full my-8 flex gap-2">
        <!-- Actions -->
        <Button :disabled="data?.status.running || isLoading" severity="success" label="Start" @click="start" />
        <Button :disabled="!data?.status.running || isLoading" severity="danger" label="Restart" @click="restart" />
        <Button :disabled="!data?.status.running || isLoading" severity="danger" label="Stop" @click="stop" />
    </section>
    <Console @executeCommand="executeCommand" />
    <section class="w-full my-8 flex gap-2">
        <InputText :disabled="!data?.status.running" class="w-full" v-model="command" type="text"
            placeholder="Send a command" />
        <Button :disabled="command.trim() === '' || !data?.status.running" :loading="executeFetch.pending.value"
            label="Execute" @click="execute" />
    </section>
</template>

<script setup lang="ts">
const startFetch = await useApi('/api/server/start', { method: 'POST', immediate: false })
const stopFetch = await useApi('/api/server/stop', { method: 'POST', immediate: false })
const restartFetch = await useApi('/api/server/restart', { method: 'POST', immediate: false })

const isLoading = computed(() => {
    return startFetch.pending.value || stopFetch.pending.value || restartFetch.pending.value || executeFetch.pending.value
})

const command = ref('')
const executeFetch = await useApi('/api/server/execute', { method: 'POST', immediate: false, watch: false, body: { command: command } })

const { data, refresh } = await useApi('/api/panel')

const start = async () => {
    await startFetch.execute()
    await refresh()
}

const restart = async () => {
    await restartFetch.execute()
    await refresh()
}

const stop = async () => {
    await stopFetch.execute()
    await refresh()
}

const execute = async () => {
    if (command.value.trim() === '') return
    await executeFetch.execute()
    command.value = ''
}

const executeCommand = async (c: string) => {
    command.value = c
    await execute()
}
</script>