<template>
    <div>
        <h2 class="text-2xl font-bold">Installed Mods</h2>
        <div class="flex gap-2 flex-col mt-4" v-if="pending != true && data != undefined">
            <ModsMod :mod="mod" v-for="mod in data.installed" @refresh="refresh()"/>
        </div>
        <FileUpload @before-upload="onBeforeUpload" @progress="onProgress" :chooseLabel="'Upload a mod'" :multiple="false" mode="basic" name="mod" url="/api/mods/upload" accept=".jar,.zip"
            @upload="onUpload" :auto="true" />

            <Dialog v-model:visible="showModal" modal header="Upload Progress" :closable="false" :closeOnEscape="false">
        <ProgressBar :pt="{ 'value': { 'style': { 'transition': 'width 50ms' } } }" class="transition-none" max="100"
            min="0" :value="progress" />
    </Dialog>
    </div>
</template>

<script setup lang="ts">
const { data, refresh, pending } = await useApi('/api/mods/mods', { immediate: false })
export type Mod = (typeof data.value.installed)[number]
onMounted(() => {
    refresh()
})

const toast = useToast();

const showModal = ref(false)
const progress = ref(0)

const onBeforeUpload = () => {
    showModal.value = true
}

const onProgress = (event: any) => {
    progress.value = event.progress
}

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    showModal.value = false
    refresh()
};

</script>