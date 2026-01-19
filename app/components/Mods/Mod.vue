<template>
    <div class="p-4 rounded bg-gray-800 flex items-center justify-between">
        {{ mod.name }} | {{ mod.version }}
        <div>
            <!-- <i class="pi pi-times w-6 h-6" /> -->
            <Button v-if="mod.directoryConfig" :loading="fetchConfig.pending.value === true"
                v-tooltip="'Edit configuration'" icon="pi pi-cog" class="cursor-pointer w-6 h-6"
                @click="fetchModConfig" />
        </div>

    </div>

    <Dialog v-model:visible="visible" modal header="Edit Mod" :style="{ width: '80%', height: '80%' }">
        <div class="flex gap-2">
            <div class="overflow-y-hidden w-1/3 h-full">
                <Tree selectionMode="single" @nodeSelect="onNodeSelect" :value="configTree"></Tree>

            </div>
            <div v-if="activeContent" class="w-full h-full">
                <Textarea v-model="activeContentEditing" class="w-full" rows="20" />
                <Button label="Save" @click="saveConfig" />
            </div>
        </div>
    </Dialog>

</template>

<script setup lang="ts">
import type { FileTreeItem } from '~~/server/services/ModService';

const toast = useToast();

const props = defineProps<{
    mod: any
}>()

const visible = ref(false)

const fetchConfig = useApi(`/api/mods/mod/${props.mod.name}`, { immediate: false })

const activeContent = ref<any>(null)
const activeContentEditing = ref<string | null>(null)

function onNodeSelect(event: any) {
    if (event.data != null) {
        activeContent.value = event
        activeContentEditing.value = event.data.content || null
    }
}

async function fetchModConfig() {
    await fetchConfig.refresh()
    visible.value = true
}

async function saveConfig() {
    await fetch(`/api/mods/mod/edit/${props.mod.name}`, {
        method: "POST",
        body: JSON.stringify({
            path: activeContent.value?.data?.path,
            content: activeContentEditing.value
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    toast.add({ severity: 'info', summary: 'Success', detail: 'File modified', life: 3000 })
    await fetchConfig.refresh()
}

function transformFileTreeToTree(items: FileTreeItem[], parentKey: string = '', index: number = 0): any[] {
    return items.map((item, i) => {
        const key = parentKey ? `${parentKey}-${i}` : `${i}`
        const isFolder = item.children && item.children.length > 0

        return {
            key,
            label: item.name,
            data: item.content,
            icon: isFolder ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-file',
            children: item.children ? transformFileTreeToTree(item.children, key, 0) : undefined
        }
    })
}

const configTree = computed(() => {
    if (!fetchConfig.data.value?.config) {
        return []
    }
    return transformFileTreeToTree(fetchConfig.data.value.config)
})
</script>