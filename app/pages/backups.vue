<template>
    <div>
        <Button class="mb-8" label="Create a backup" @click="createBackup" />

        <BackupImport />

        <div v-if="pending != true && data != undefined" class="flex flex-wrap gap-4">

            <Card v-for="backup in data.backups">
                <template #title>
                    <div class="flex justify-between items-center">
                        <p>{{ backup.name }}
                            <span class="text-sm text-gray-500">
                                ({{ Math.round(backup.size / 1024 / 1024) }} Mb)
                            </span>
                        </p>
                        <Button variant="text" v-tooltip.top="'Download backup'" icon="pi pi-download" severity="info"
                            rounded aria-label="Download" @click="downloadBackup(backup.name)" />


                    </div>
                </template>
                <template #content>
                    <div class="flex justify-between gap-8 items-center">

                        <p class="text-gray-400">Backup from {{ backup.date }}</p>
                        <div class="flex gap-2">
                            <Button variant="text" raised v-tooltip.top="'Delete backup'" icon="pi pi-trash"
                                severity="warn" rounded aria-label="Delete" @click="confirmDeleteBackup(backup.name)" />
                            <Button variant="text" raised v-tooltip.top="'Restore backup'" icon="pi pi-undo"
                                severity="danger" rounded aria-label="Restore"
                                @click="confirmRestoreBackup(backup.name)" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
const toast = useToast();
const confirm = useConfirm();

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

const downloadBackup = async (backupName: string) => {
    window.open(`/api/backups/download?backupName=${backupName}`, '_blank')
}

const confirmDeleteBackup = async (backupName: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this backup?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete'
        },
        accept: () => {
            deleteBackup(backupName)
        }
    })
}

const deleteBackup = async (backupName: string) => {
    await $fetch('/api/backups/backup', {
        method: 'DELETE',
        body: { backupName: backupName }
    })
    toast.add({ severity: 'info', summary: 'Success', detail: 'Backup deleted', life: 3000 })
    refresh()
}

const confirmRestoreBackup = async (backupName: string) => {
    confirm.require({
        message: 'Are you sure you want to restore this backup? Your current server data will be erased by this backup',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Restore'
        },
        accept: () => {
            restoreBackup(backupName)
        }
    })
}

const restoreBackup = async (backupName: string) => {
    await $fetch('/api/backups/restore', {
        method: 'POST',
        body: { backupName: backupName }
    })
    toast.add({ severity: 'info', summary: 'Success', detail: 'Backup restored', life: 3000 })
    refresh()
}
</script>