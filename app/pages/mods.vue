<template>
    <div>
        <h2 class="text-2xl font-bold">Installed Mods</h2>
        <div class="flex gap-2 flex-col mt-4" v-if="pending != true && data != undefined">
            <ModsMod :mod="mod" v-for="mod in data.installed" />
        </div>
        <h2>Upload a mod</h2>
        <FileUpload :multiple="false" mode="basic" name="mod" url="/api/mods/upload" accept=".jar,.zip"
        :maxFileSize="1000000" @upload="onUpload" :auto="true" />
    </div>
</template>

<script setup lang="ts">
const { data, refresh, pending } = await useApi('/api/mods/mods', { immediate: false })
onMounted(() => {
    refresh()
})

const toast = useToast();

const onUpload = () => {
    toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
    refresh()
};

</script>