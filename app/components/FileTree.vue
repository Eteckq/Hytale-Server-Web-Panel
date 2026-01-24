<template>
    <div class="flex gap-4 h-full">
        <Tree @nodeSelect="onNodeSelect" :value="nodes" @node-expand="onNodeExpand" loadingMode="icon"
            class="w-full h-full overflow-y-scroll" selectionMode="single"></Tree>
        <div v-if="selectedNode" class="w-full h-full">
            <p class="text-sm text-gray-500">{{ selectedNode.data.path }}</p>
            <Textarea v-model="selectedNode.data.content" class="w-full" rows="20" />
            <Button :loading="loading" class="w-full" label="Save" @click="saveContent" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TreeNode } from 'primevue/treenode'

const toast = useToast();

// Set initial path default to empty string
const props = defineProps<{
    initialPath?: string
}>()

const selectedNode = ref<TreeNode | null>(null)
const nodes: Ref<TreeNode[]> = ref([]);

const loading = ref(false)


const saveContent = async () => {
    if (!selectedNode.value) {
        return
    }
    loading.value = true
    await $fetch(`/api/file/edit`, {
        method: "PATCH",
        body: JSON.stringify({
            path: selectedNode.value.data.path,
            content: selectedNode.value.data.content
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    loading.value = false
    toast.add({ severity: 'info', summary: 'Success', detail: 'File modified', life: 3000 })
}

const fetchFolder = async (subpath: string = "") => {
    const data = await $fetch(`/api/file/file?subpath=${subpath}`)
    const nodes: TreeNode[] = data.data.map((item) => {
        return {
            key: item.path,
            label: item.name,
            leaf: item.type === 'file',
            loading: false,
            icon: item.type === 'directory' ? 'pi  pi-folder' : item.content ? 'pi  pi-pencil' : 'pi  pi-file-o',
            data: {
                content: item.content,
                path: item.path
            }
        }
    })
    return nodes
}


onMounted(async () => {
    nodes.value = await fetchFolder(props.initialPath || "")
})

const onNodeExpand = async (node: TreeNode) => {
    node.loading = true;
    node.children = await fetchFolder(node.data.path)
    node.loading = false
};

const onNodeSelect = (event: TreeNode) => {
    if (event.data.content) {
        selectedNode.value = event
    }
}

</script>