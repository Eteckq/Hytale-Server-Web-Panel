<template>
    <div class="flex h-screen">
        <nav class="bg-gray-800 p-4 gap-8 flex flex-col items-center">
            <img src="/logo-h.png" alt="Hytale Panel">
            <!-- Top -->
            <div class="text-center w-36">
                Hytale Panel
            </div>

            <Menu :model="items">
                <template #item="{ item, props }">
                    <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                        </a>
                    </router-link>
                </template>
            </Menu>
        </nav>
        <div class="bg-gray-900 w-full p-8">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const items = ref([
    {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        to: '/',
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        to: '/settings',
    },
    {
        label: 'Mods',
        icon: 'pi pi-download',
        to: '/mods',
    },
    {
        label: 'Backups',
        icon: 'pi pi-download',
        to: '/backups',
    },
])
</script>