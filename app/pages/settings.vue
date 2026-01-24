<template>
    <div>
        <Card>
            <template #title>
                Server version
            </template>
            <template #content>
                <p>Patchline version: {{ data?.patchline }} <Badge v-tooltip.top="'Change the patchline by changing environment variable HYTALE_PATCHLINE and restarting the manager'"><i  class="pi pi-info"></i></Badge></p>
                <p>Installed version: {{ data?.installedVersion }}</p>
                <p>Last version: {{ data?.lastVersion }}</p>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button :loading="pending" :label="data?.lastVersion == data?.installedVersion ? 'Force update server' : 'Update server'"
                        :severity="data?.lastVersion == data?.installedVersion ? 'info' : 'warn'" class="w-full"
                        @click="confirmDeleteServer()" />
                </div>
            </template>
        </Card>



    </div>
</template>

<script setup lang="ts">
const toast = useToast()
const confirm = useConfirm()
const { data, refresh, pending } = await useApi('/api/settings/settings', { immediate: false })

onMounted(async () => {
    refresh()
})


const confirmDeleteServer = async () => {
    confirm.require({
        message: 'Are you sure you want to reinstall the server ? Only server files will be deleted & re-installed. Doing a backup before is recommended.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Reinstall'
        },
        accept: () => {
            reinstallServer()
        }
    })
}
async function reinstallServer() {
    const result = await $fetch('/api/settings/server', { method: "DELETE" })
    toast.add({
        severity: 'info', summary: 'Success', detail: 'Server has been deleted. Hytale server has been started to download it again', life: 3000
    })
}
</script>