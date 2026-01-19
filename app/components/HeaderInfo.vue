<template>
    <section class="w-full bg-gray-800 p-4 rounded">
        <span v-if="!data">Loading...</span>
        <span v-else :class="data?.status.running ? 'text-green-500' : 'text-red-500'" class="font-bold text-2xl">
            {{ data?.status.running ? 'Online' : 'Offline' }}
        </span>
    </section>
</template>

<script setup lang="ts">
import type { PanelResponseData } from '~~/server/api/panel.get';


const props = defineProps<{
    data: PanelResponseData | undefined
}>()

</script>