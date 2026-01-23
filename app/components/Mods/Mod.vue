<template>
    <div class="p-4 rounded bg-gray-800 flex items-center justify-between">
        <p>{{ mod.name }} <span class="text-green-700">{{ mod.version }}</span></p>
        <div>
            <span class="text-gray-300">{{ mod.file }}</span>
            <span class="text-gray-500 mx-4">{{ mod.directoryConfig }}</span>
            <!-- <i class="pi pi-times w-6 h-6" /> -->
            <Button v-if="mod.directoryConfig"
                v-tooltip.left="'Edit configuration'" icon="pi pi-cog" class="cursor-pointer w-6 h-6" @click="visible = true"
                 />
        </div>
    </div>

    <Dialog v-model:visible="visible" modal header="Edit Mod" :style="{ width: '80%', height: '80%' }">
        <FileTree :initialPath="`/mods/${props.mod.directoryConfig}`" />
    </Dialog>

</template>

<script setup lang="ts">



const props = defineProps<{
    mod: any
}>()

const visible = ref(false)


</script>