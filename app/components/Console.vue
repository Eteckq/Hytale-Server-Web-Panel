<template>
    <Message class="mb-4" v-if="actionRequired" severity="info"> <a v-if="actionRequired.type === 'authorization'"
            :href="actionRequired.url" target="_blank">{{ actionRequired.message }}</a> <span v-else><Button
                :label="actionRequired.command" @click="emit('executeCommand', actionRequired.command)" /></span>
    </Message>
    <section class="w-full bg-gray-900 p-4 rounded border">
        <div ref="terminalRef" class=""></div>
    </section>
</template>

<script setup lang="ts">
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'

const emit = defineEmits<{
    (e: 'executeCommand', command: string): void
}>()

type ActionRequired =
    | {
        type: 'authorization'
        code: string
        message: string
        url: string
    }
    | {
        type: 'command'
        command: string
        message: string
    }
    | null

const actionRequired = ref<ActionRequired | null>(null)

const terminalRef = ref<HTMLElement | null>(null)
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null

// Fit on resize
const handleResize = () => {
    if (fitAddon) {
        fitAddon.fit()
    }
}



function analyseLogToCheckIfActionRequired(log: string) {
    // 1️⃣ OAuth device authorization (prioritaire)
    const authorizationCode = log.match(/verify\?user_code=(\w+)/)?.[1]

    if (authorizationCode) {
        actionRequired.value = {
            type: 'authorization',
            code: authorizationCode,
            message: `Authorization required! ${authorizationCode}`,
            url: `https://oauth.accounts.hytale.com/oauth2/device/verify?user_code=${authorizationCode}`,
        }
    }

    // 2️⃣ Command rules
    const rules = [
        {
            patterns: [
                /WARNING: Credentials stored in memory only/,
            ],
            command: 'auth persistence Encrypted',
        },
        {
            patterns: [
                /No server tokens configured\. Use \/auth login to authenticate/,
            ],
            command: 'auth login device',
        },
    ]

    const matchedRule = rules.find(({ patterns }) =>
        patterns.some(pattern => pattern.test(log))
    )

    if (matchedRule) {
        console.log('matchedRule', matchedRule)
        actionRequired.value = {
            type: 'command',
            command: matchedRule.command,
            message: `Action required! ${matchedRule.command}`,
        }
        return
    }

    // 3️⃣ Nothing to do
    actionRequired.value = null
}


onMounted(async () => {
    if (!terminalRef.value) return

    fitAddon = new FitAddon();
    terminal = new Terminal({
        theme: {
            background: '#111827',
        },
        cursorBlink: false,
        allowTransparency: true,
        disableStdin: true,

        fontSize: 14,
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    })
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.value)
    fitAddon.fit()
    window.addEventListener('resize', handleResize)
    try {
        const response = await fetch('/server/logs')
        if (!response.body) return

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

        while (true) {
            const { value, done } = await reader.read()
            if (done) break
            if (value && terminal) {
                terminal.write(value)
                analyseLogToCheckIfActionRequired(value)
            }
        }
    } catch (error) {
        console.error('Error streaming logs:', error)
        if (terminal) {
            terminal.writeln('\r\n\x1b[31mError: Failed to connect to log stream\x1b[0m')
        }
    }
})

onUnmounted(() => {
    if (terminal) {
        terminal.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>
