<template>
    <div>
        <Card>
            <template #title>
                Server version
                <Message severity="success" v-if="isupToDate">
                    <span>Up to date</span>
                </Message>
            </template>
            <template #content>
                <p>Patchline version: {{ data?.patchline }} <Badge
                        v-tooltip.top="'Change the patchline by changing environment variable HYTALE_PATCHLINE and restarting the manager'">
                        <i class="pi pi-info"></i>
                    </Badge>
                </p>
                <p>Installed version: {{ data?.installedVersion }}</p>
                <div>
                    Last version: {{ data?.lastVersion.version }}
                    <Button :loading="refreshLastVersionReq.pending.value"
                        v-tooltip.top="data?.lastVersion.timestamp ? `Last version checked at ${new Date(data?.lastVersion.timestamp).toLocaleString()}` : 'Last version not checked yet. Click to refresh.'"
                        @click="refreshLastVersion()">
                        <i class="pi pi-refresh"></i>
                    </Button>
                </div>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">

                    <Button :loading="pending" :label="isupToDate ? 'Force update server' : 'Update server'"
                        :severity="isupToDate ? 'info' : 'warn'" class="w-full" @click="confirmDeleteServer()" />
                </div>
            </template>
        </Card>



    </div>
</template>

<script setup lang="ts">
const toast = useToast()
const confirm = useConfirm()
const { data, refresh, pending } = await useApi('/api/settings/settings', { immediate: false })
const refreshLastVersionReq = await useApi('/api/settings/refresh-version', { immediate: false })

onMounted(async () => {
    refresh()
})

const isupToDate = computed(() => {
    return data.value?.lastVersion.version == data.value?.installedVersion
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

const refreshLastVersion = async () => {
    await refreshLastVersionReq.refresh()
    toast.add({
        severity: 'info', summary: 'Success', detail: 'Last version has been refreshed', life: 3000
    })
    await refresh()
}
</script>