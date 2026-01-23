<template>
    <div class="flex h-screen">
        <nav class="bg-gray-800 p-4 gap-8 flex flex-col items-center justify-center w-20 md:w-52">
            <img  src="/logo-h.png" alt="Hytale Panel">

            <div class="text-center text-2xl font-bold hidden md:block">
                Hytale Panel
            </div>

            <Menu class="bg-transparent border-transparent" :model="items">
                <template #item="{ item, props }">
                    <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
                        <a class="py-2 flex items-center justify-center md:justify-start" v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span :class="item.icon" />
                            <span class="hidden md:block ml-2">{{ item.label }}</span>
                        </a>
                    </router-link>
                </template>
            </Menu>
        </nav>
        <div class="bg-gray-900 w-full p-8 overflow-y-scroll">
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
        label: 'Files',
        icon: 'pi pi-file',
        to: '/files',
    },
    {
        label: 'Mods',
        icon: 'pi pi-wrench',
        to: '/mods',
    },
    {
        label: 'Backups',
        icon: 'pi pi-save',
        to: '/backups',
    },
])
</script>