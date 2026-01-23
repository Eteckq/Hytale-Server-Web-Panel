<template>
    <Message class="mb-4 p-2" v-if="actionRequired" severity="warn">
        {{ actionRequired.message }}:
        <a v-if="actionRequired.type === 'authorization'" class="ml-8 bg-green-600 text-white rounded px-4 py-2" :href="actionRequired.url" target="_blank">
            Authorize device <span class="italic">{{ actionRequired.code }}</span>
        </a>
        <Button v-else :label="actionRequired.command" @click="emit('executeCommand', actionRequired.command)" />
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



type LogRule =
    | {
        patterns: RegExp[]
        type: 'authorization'
        handler: (match: RegExpMatchArray) => ActionRequired
    }
    | {
        patterns: RegExp[]
        type: 'command'
        command: string
        message?: string
    }

function analyseLogToCheckIfActionRequired(log: string) {
    // Start from end of log
    const logToAnalyse = log.split('\n').reverse().join('\n')
    const rules: LogRule[] = [
        {
            patterns: [/user_code=(\w+)/],
            type: 'authorization',
            handler: (match) => {
                const code = match[1]
                if (!code) {
                    return null
                }
                return {
                    type: 'authorization',
                    code,
                    message: `Authorization required! Click here to authorize`,
                    url: `https://oauth.accounts.hytale.com/oauth2/device/verify?user_code=${code}`,
                }
            },
        },
        {
            patterns: [/WARNING: Credentials stored in memory only/],
            type: 'command',
            command: 'auth persistence Encrypted',
            message: `Authorization recommended: Click here set persistence auth`,
        },
        {
            patterns: [/No server tokens configured\. Use \/auth login to authenticate/],
            type: 'command',
            command: 'auth login device',
        },
    ]

    for (const rule of rules) {
        for (const pattern of rule.patterns) {
            const match = logToAnalyse.match(pattern)
            if (match) {
                if (rule.type === 'authorization') {
                    const action = rule.handler(match)
                    if (action) {
                        actionRequired.value = action
                        return
                    }
                } else {
                    actionRequired.value = {
                        type: 'command',
                        command: rule.command,
                        message: rule.message || `Action required! Click to execute`,
                    }
                    return
                }
            }
        }
    }

    // No rule matched
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

    const logsStore = useLogsStore()

    try {
        // Display history first
        const history = logsStore.getLogHistory()
        for (const log of history) {
            terminal.write(log)
            analyseLogToCheckIfActionRequired(log)
        }

        // Setup stream with events
        const eventTarget = await logsStore.getOrCreateEventTarget()

        // Listen to data events
        eventTarget.addEventListener('data', ((e: CustomEvent<string>) => {
            const chunk = e.detail
            if (terminal && chunk) {
                terminal.write(chunk)
                analyseLogToCheckIfActionRequired(chunk)
            }
        }) as EventListener)

        // Listen to end events
        eventTarget.addEventListener('end', () => {
            if (terminal) {
                terminal.writeln('\r\n\x1b[33mLog stream ended\x1b[0m')
            }
        })

        // Listen to error events
        eventTarget.addEventListener('error', ((e: CustomEvent<string>) => {
            const error = e.detail
            console.error('Log stream error:', error)
            if (terminal) {
                terminal.writeln(`\r\n\x1b[31mError: ${error}\x1b[0m`)
            }
        }) as EventListener)

    } catch (error) {
        console.error('Error setting up log stream:', error)
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
