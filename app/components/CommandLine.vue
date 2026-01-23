<template>
    <section class="w-full my-8 flex gap-2">
        <InputText @keyup.enter="execute" :disabled="!running" class="w-full" v-model="command" type="text" placeholder="Send a command" />
        <Button :disabled="command.trim() === '' || !running" label="Execute" @click="execute" />
    </section>
</template>

<script setup lang="ts">

const props = defineProps<{
    running: boolean | undefined
}>()

const emit = defineEmits<{
    (e: 'execute', command: string): void
}>()

const command = ref('')


const execute = async () => {
    if (command.value.trim() === '') return
    emit('execute', command.value)
    command.value = ''
}

</script>