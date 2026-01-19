<template>
    <HeaderInfo :data="data" />
    <ActionButtons :running="data?.status.running" @refresh="refresh" />
    <Console @executeCommand="executeCommand" />
    <section class="w-full my-8 flex gap-2">
        <InputText :disabled="!data?.status.running" class="w-full" v-model="command" type="text"
            placeholder="Send a command" />
        <Button :disabled="command.trim() === '' || !data?.status.running" :loading="executeFetch.pending.value"
            label="Execute" @click="execute" />
    </section>
</template>

<script setup lang="ts">

const command = ref('')
const executeFetch = await useApi('/api/server/execute', { method: 'POST', immediate: false, watch: false, body: { command: command } })

const panelResponse = await useApi('/api/panel', { immediate: false })
const { data, refresh, pending } = panelResponse

onMounted(() => {
    refresh()
})


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