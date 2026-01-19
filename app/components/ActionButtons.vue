<template>
    <section class="w-full my-8 flex gap-2 items-center justify-center">
        <Button :disabled="running || isLoading" severity="success" label="Start" @click="start" />
        <Button :disabled="!running || isLoading" severity="danger" label="Restart" @click="restart" />
        <Button :disabled="!running || isLoading" severity="danger" label="Stop" @click="stop" />
    </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const props = defineProps<{
    running: boolean | undefined
}>()

const startFetch = await useApi('/api/server/start', { method: 'POST', immediate: false })
const stopFetch = await useApi('/api/server/stop', { method: 'POST', immediate: false })
const restartFetch = await useApi('/api/server/restart', { method: 'POST', immediate: false })

const isLoading = computed(() => {
    return props.running == undefined || startFetch.pending.value || stopFetch.pending.value || restartFetch.pending.value
})


const start = async () => {
    await startFetch.execute()
    emit('refresh')
}

const restart = async () => {
    await restartFetch.execute()
    emit('refresh')
}

const stop = async () => {
    await stopFetch.execute()
    emit('refresh')
}

</script>