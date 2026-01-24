<template>
    <p>Import a backup</p>
    <p>Here, you can import a backup file</p>
    <p>Only .zip files are supported</p>
    <p>Then, you will be able to import the backup to the server</p>
    <FileUpload @before-upload="onBeforeUpload" @progress="onProgress" :chooseLabel="'Upload a backup'"
        :multiple="false" mode="basic" name="backup" url="/api/backups/import" accept=".zip" @upload="onUpload"
        :auto="true" />

    <Dialog v-model:visible="showModal" modal header="Upload Progress" :closable="false" :closeOnEscape="false">
        <ProgressBar :pt="{ 'value': { 'style': { 'transition': 'width 50ms' } } }" class="transition-none" max="100"
            min="0" :value="progress" />
    </Dialog>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const toast = useToast()

const progress = ref(0)
const showModal = ref(false)


function onBeforeUpload() {
    showModal.value = true
}

function onProgress(event: any) {
    progress.value = event.progress
}

function onUpload() {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 })
    showModal.value = false
    // emit refresh
    emit('refresh')
}

</script>