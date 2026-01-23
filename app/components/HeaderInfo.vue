<template>
    <section class="w-full bg-gray-800 p-4 rounded">
        <span v-if="!data">Loading...</span>
        <div v-else class="flex gap-8 items-center">
            <span :class="data?.status.running ? 'text-green-500' : 'text-red-500'" class="font-bold text-2xl">
                {{ data?.status.running ? 'Online' : 'Offline' }}
            </span>
            <span v-if="data.stats.memory_mb && data.stats.memory_limit_mb" class="text-gray-500">{{ Math.round(data.stats.memory_mb / 1024) }}GB / {{ data.stats.memory_limit_mb / 1024 }}GB</span>
            <span>{{ data.stats.memory_percent }}%</span>
        </div>
    </section>
</template>

<script setup lang="ts">
import type { PanelResponseData } from '~~/server/api/panel.get';


const props = defineProps<{
    data: PanelResponseData | undefined
}>()

</script>