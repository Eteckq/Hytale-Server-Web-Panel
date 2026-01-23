<template>
    <div>
        <Tree @nodeSelect="onNodeSelect" :value="nodes" @node-expand="onNodeExpand" loadingMode="icon"
            class="w-full md:w-[30rem]" selectionMode="single"></Tree>
        <div v-if="selectedNode">
            <Textarea v-model="selectedNode.data.content" class="w-full" rows="20" />
            <Button label="Save" @click="saveContent" />
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


const saveContent = async () => {
    if (!selectedNode.value) {
        return
    }
    await fetch(`/api/file/edit`, {
        method: "PATCH",
        body: JSON.stringify({
            path: selectedNode.value.data.path,
            content: selectedNode.value.data.content
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    toast.add({ severity: 'info', summary: 'Success', detail: 'File modified', life: 3000 })
}

const fetchFolder = async (subpath: string = "") => {
    const data = await $fetch(`/api/file/file?subpath=${subpath}`)
    const nodes: TreeNode[] = data.data.map((item) => {
        return {
            key: item.name,
            label: item.name,
            leaf: item.type === 'file',
            loading: false,
            icon: item.type === 'directory' ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-file',
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

const onNodeSelect = (event: any) => {
    selectedNode.value = event
}

</script>