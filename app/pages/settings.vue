<template>
    <div>
        <h2 class="text-2xl font-bold">Settings</h2>
        {{ pending }}
        <div class="flex gap-2 flex-col mt-4">
            {{ data }}
        </div>

        <Card>
            <template #title>
                Update server
            </template>
            <template #content>
                <p>Here, you can update the server version.</p>

                <p>by clicking on this button, server files (Assets.zip & HytaleServer.jar) will be deleted</p>
                <p>Server container will be started, to download these files again</p>
                <Button label="Re-install server" @click="confirmDeleteServer" />
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
        message: 'Are you sure you want to reinstall the server ? Only server files will be deleted & re-installed',
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