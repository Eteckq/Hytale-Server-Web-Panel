<template>
    <div class="p-4 rounded bg-gray-800 flex items-center justify-between">
        <p>{{ mod.name }} <span class="text-green-700">{{ mod.version }}</span></p>
        <div class="flex items-center gap-2">
            <span class="text-gray-300">{{ mod.file }}</span>
            <span class="text-gray-500 mx-4">{{ mod.directoryConfig }}</span>
            <!-- <i class="pi pi-times w-6 h-6" /> -->
            <Button v-if="mod.directoryConfig" v-tooltip.left="'Edit configuration'" icon="pi pi-cog"
                class="cursor-pointer w-6 h-6" @click="visible = true" />
            <ToggleSwitch v-tooltip.left="mod.enabled == true ? 'Disable' : 'Enable'" :modelValue="mod.enabled"
                @click="toggleMod()" />
        </div>
    </div>

    <Dialog v-model:visible="visible" modal header="Edit Mod" :style="{ width: '80%', height: '80%' }">
        <FileTree :initialPath="`/mods/${props.mod.directoryConfig}`" />
    </Dialog>

</template>

<script setup lang="ts">
import type { Mod } from '~/pages/mods.vue';




const props = defineProps<{
    mod: Mod
}>()

const visible = ref(false)

const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const toggleMod = async () => {
    await $fetch(`/api/mods/toggle`, {
        method: "PATCH",
        body: JSON.stringify({
            modFile: props.mod.file
        }),
    })
    emit('refresh')
}

</script>