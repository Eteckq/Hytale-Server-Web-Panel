<template>
    <div>
        <h2 class="text-2xl font-bold">Installed Mods</h2>
        <div class="flex gap-2 flex-col mt-4" v-if="pending != true && data != undefined">
            <ModsMod :mod="mod" v-for="mod in data.installed" @refresh="refresh()" />
        </div>

        <Uploader :chooseLabel="'Upload a mod'" :multiple="true" accept=".jar,.zip" :path="'data/mods'" @upload="refresh" />
    </div>
</template>

<script setup lang="ts">
const { data, refresh, pending } = await useApi('/api/mods/mods', { immediate: false })
export type Mod = (typeof data.value.installed)[number]
onMounted(() => {
    refresh()
})


</script>