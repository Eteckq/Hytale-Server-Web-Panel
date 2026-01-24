<template>
    <Card>
        <template #title>
            <div class="flex justify-between items-center">
                <p>{{ backup.name }}
                    <span class="text-sm text-gray-500">
                        ({{ Math.round(backup.size / 1024 / 1024) }} Mb)
                    </span>
                </p>
                <Button variant="text" v-tooltip.top="'Download backup'" icon="pi pi-download" severity="info" rounded
                    aria-label="Download" @click="downloadBackup(backup.name)" />


            </div>
        </template>
        <template #content>
            <div class="flex justify-between gap-8 items-center">

                <p class="text-gray-400">Backup from {{ backup.date }}</p>
                <div class="flex gap-2">
                    <Button variant="text" raised v-tooltip.top="'Delete backup'" icon="pi pi-trash" severity="warn"
                        rounded aria-label="Delete" @click="confirmDeleteBackup(backup.name)" />
                    <Button variant="text" raised v-tooltip.top="'Restore backup'" icon="pi pi-undo" severity="danger"
                        rounded aria-label="Restore" @click="confirmRestoreBackup(backup.name)" />
                </div>
            </div>
        </template>
    </Card>
    <Dialog v-model:visible="restoring" modal header="Restoring backup" :closable="false" :closeOnEscape="false">
        <div class="flex justify-center items-center overflow-hidden">
            <ProgressSpinner />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
const toast = useToast();
const confirm = useConfirm();
const emit = defineEmits<{
    (e: 'refresh'): void
}>()
const props = defineProps<{
    backup: any
}>()

const restoring = ref(false)

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
    emit('refresh')
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
    restoring.value = true
    await $fetch('/api/backups/restore', {
        method: 'POST',
        body: { backupName: backupName }
    }).then(() => {
        toast.add({ severity: 'info', summary: 'Success', detail: 'Backup restored', life: 3000 })
        emit('refresh')
    }).catch(() => {
        restoring.value = false
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to restore backup', life: 3000 })
    }).finally(() => {
        restoring.value = false
    })
}
</script>