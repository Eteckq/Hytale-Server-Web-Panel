<template>
    <p>Import a backup</p>
    <p>Here, you can import a backup file</p>
    <p>Only .zip files are supported</p>
    <p>Then, you will be able to import the backup to the server</p>
    <FileUpload :multiple="false" mode="basic" name="backup" url="/api/backups/import" accept=".zip"
         @upload="onUpload" :auto="true" />
</template>

<script setup lang="ts">
const toast = useToast()

function onUpload() {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 })
}

</script>