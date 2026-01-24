<template>
    <div>
        <FileUpload :auto="true" mode="basic" :chooseLabel="chooseLabel" :multiple="multiple" @select="onFileSelect" name="file"
            customUpload :accept="accept" >
        </FileUpload>

        <Dialog v-model:visible="showModal" modal header="Upload Progress" :closable="false" :closeOnEscape="false">
            <ProgressBar :pt="{ 'value': { 'style': { 'transition': 'width 50ms' } } }" class="transition-none"
                max="100" min="0" :value="progress" />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import type { FileUploadSelectEvent } from 'primevue';

const emit = defineEmits<{
    (e: 'upload'): void
    (e: 'progress', progress: number): void
}>()

const props = defineProps<{
    chooseLabel: string
    multiple: boolean
    accept: string
    path: string
}>()

const toast = useToast();

const showModal = ref(false)
const progress = ref(0)

const onFileSelect = async (event: FileUploadSelectEvent) => {
    let xhr = new XMLHttpRequest();

    const formData = new FormData()
    formData.append('path', props.path)

    for (const file of event.files) {
        formData.append('file', file, file.name)
    }

    showModal.value = true
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            progress.value = Math.round((event.loaded * 100) / event.total);
        }

        emit('progress', progress.value);
    });

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            progress.value = 0;
            showModal.value = false
            emit('upload')
        }
    };

    xhr.open('POST', '/api/file/upload', true);
    xhr.send(formData);
}



</script>