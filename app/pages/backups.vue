<template>
    <div>
        <Button class="mb-8" label="Create a backup" @click="createBackup" />


        <p>Import a backup</p>
        <p>Here, you can import a backup file</p>
        <p>Only .zip files are supported</p>
        <p>Then, you will be able to import the backup to the server</p>
        <Uploader :chooseLabel="'Upload a backup'" :multiple="false" accept=".zip" :path="'backups'"
            @upload="refresh" />


        <div v-if="pending != true && data != undefined" class="flex flex-wrap gap-4">
            <Backup :backup="backup" v-for="backup in data.backups" @refresh="refresh()" />
        </div>
    </div>
</template>

<script setup lang="ts">
const toast = useToast();

const { data, refresh, pending } = await useApi('/api/backups/backups', { immediate: false })
onMounted(() => {
    refresh()
})

const createBackup = async () => {
    toast.add({ severity: 'info', summary: 'Creating backup', detail: 'Please wait', life: 3000 })
    await $fetch('/api/backups/create', {
        method: 'POST',
    })
    toast.add({ severity: 'info', summary: 'Success', detail: 'Backup created', life: 3000 })
    refresh()
}

</script>