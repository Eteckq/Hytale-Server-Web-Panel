import Docker from 'dockerode';
import { Readable } from 'stream';
import { EventEmitter } from 'events';

class DockerService extends EventEmitter {
    private docker: Docker
    public currentLogStream: Readable | null = null
    private currentAttachStream: NodeJS.ReadWriteStream | null = null
    private streamTimestamp: number = 0
    private logHistory: Buffer[] = []
    private readonly maxHistorySize = 10000 // Max 10KB of history

    constructor() {
        super()
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' })
        // Increase max listeners to avoid warnings with multiple clients
        this.setMaxListeners(0)
    }

    public async getHytaleContainer() {
        return await this.docker.getContainer('hytale')

    }

    public async getStatus() {
        try {
            const container = await this.getHytaleContainer();

            const info = await container.inspect();
            return {
                status: info.State.Status,
                running: info.State.Running,
                name: info.Name.replace('/', ''),
                created: info.Created,
                started_at: info.State.StartedAt,
            };
        } catch (error) {
            return {
                status: 'error',
                running: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    public async getStats() {
        try {
            const container = await this.getHytaleContainer();

            const info = await container.inspect();
            if (!info.State.Running) {
                return { error: 'Container not running' };
            }

            const stats = await container.stats({ stream: false });

            // Calculate CPU percentage
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const cpuCount = stats.cpu_stats.online_cpus || 1;
            const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * cpuCount * 100 : 0;

            // Memory usage
            const memoryUsage = stats.memory_stats.usage || 0;
            const memoryLimit = stats.memory_stats.limit || 1;
            const memoryPercent = (memoryUsage / memoryLimit) * 100;

            return {
                cpu_percent: Math.round(cpuPercent * 100) / 100,
                memory_bytes: memoryUsage,
                memory_limit_bytes: memoryLimit,
                memory_percent: Math.round(memoryPercent * 100) / 100,
                memory_mb: Math.round(memoryUsage / (1024 * 1024) * 10) / 10,
                memory_limit_mb: Math.round(memoryLimit / (1024 * 1024) * 10) / 10,
            };
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    public async start() {
        const container = await this.getHytaleContainer();
        // Stop container if it is running
        if ((await container.inspect()).State.Running) {
            return { success: false, message: 'Container is already running' };
        }
        await container.start();

        // Attach to container and keep reference for command execution
        try {
            this.currentAttachStream = await container.attach({
                stream: true,
                stdin: true,
                stdout: false,
                stderr: false,
                hijack: true,
            }) as NodeJS.ReadWriteStream;

            // Handle stream errors and cleanup
            this.currentAttachStream.on('error', () => {
                this.currentAttachStream = null;
            });

            this.currentAttachStream.on('end', () => {
                this.currentAttachStream = null;
            });
        } catch (error) {
            console.error('Failed to attach to container:', error);
            this.currentAttachStream = null;
        }

        // Invalidate current stream to force refresh
        await this.invalidateStream();
        return { success: true, message: 'Container started' };
    }

    public async executeCommandInProcess(command: string) {
        // Reuse the attach stream created during start
        if (!this.currentAttachStream) {
            // If no attach stream exists, try to create one
            const container = await this.getHytaleContainer();
            const status = await container.inspect();
            if (!status.State.Running) {
                return { success: false, message: 'Container is not running' };
            }

            try {
                this.currentAttachStream = await container.attach({
                    stream: true,
                    stdin: true,
                    stdout: false,
                    stderr: false,
                    hijack: true,
                }) as NodeJS.ReadWriteStream;

                // Handle stream errors and cleanup
                this.currentAttachStream.on('error', () => {
                    this.currentAttachStream = null;
                });

                this.currentAttachStream.on('end', () => {
                    this.currentAttachStream = null;
                });
            } catch (error) {
                return { success: false, message: `Failed to attach to container: ${error instanceof Error ? error.message : 'Unknown error'}` };
            }
        }

        try {
            this.currentAttachStream.write(command + '\n');
            return { success: true, message: 'Command executed' };
        } catch (error) {
            // If write fails, clear the reference and return error
            this.currentAttachStream = null;
            return { success: false, message: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
    }

    public async stop() {
        const container = await this.getHytaleContainer();
        if (!(await container.inspect()).State.Running) {
            return { success: false, message: 'Container is not running' };
        }
        await container.stop();

        // Cleanup attach stream
        if (this.currentAttachStream) {
            try {
                (this.currentAttachStream as any).destroy?.();
            } catch (error) {
                // Ignore errors during cleanup
            }
            this.currentAttachStream = null;
        }

        // Invalidate stream when stopping
        if (this.currentLogStream) {
            this.currentLogStream.destroy();
            this.currentLogStream = null;
        }
        this.streamTimestamp = Date.now();
        return { success: true, message: 'Container stopped' };
    }

    public async restart() {
        const container = await this.getHytaleContainer();
        if (!(await container.inspect()).State.Running) {
            return { success: false, message: 'Container is not running' };
        }
        await container.restart();

        // Cleanup old attach stream
        if (this.currentAttachStream) {
            try {
                (this.currentAttachStream as any).destroy?.();
            } catch (error) {
                // Ignore errors during cleanup
            }
            this.currentAttachStream = null;
        }

        // Re-attach to container after restart
        try {
            this.currentAttachStream = await container.attach({
                stream: true,
                stdin: true,
                stdout: false,
                stderr: false,
                hijack: true,
            }) as NodeJS.ReadWriteStream;

            // Handle stream errors and cleanup
            this.currentAttachStream.on('error', () => {
                this.currentAttachStream = null;
            });

            this.currentAttachStream.on('end', () => {
                this.currentAttachStream = null;
            });
        } catch (error) {
            console.error('Failed to attach to container after restart:', error);
            this.currentAttachStream = null;
        }

        // Invalidate current stream to force refresh
        await this.invalidateStream();
        return { success: true, message: 'Container restarted' };
    }

    private async invalidateStream() {
        const oldStream = this.currentLogStream
        this.streamTimestamp = Date.now()

        // Don't clear history - keep it for clients that reconnect
        // History will naturally be updated with new logs

        // Create new stream first
        await this.getOrCreateStream()

        // Then destroy old stream and notify (prevents flash)
        if (oldStream && oldStream !== this.currentLogStream) {
            oldStream.destroy()
        }

        this.emit('stream-refreshed')
    }

    public getLogHistory(): Buffer {
        // Return all history as a single buffer
        return Buffer.concat(this.logHistory)
    }

    private addToHistory(chunk: Buffer) {
        this.logHistory.push(chunk)

        // Limit history size
        let totalSize = 0
        for (let i = this.logHistory.length - 1; i >= 0; i--) {
            totalSize += this.logHistory[i].length
            if (totalSize > this.maxHistorySize) {
                // Remove older chunks
                this.logHistory = this.logHistory.slice(i + 1)
                break
            }
        }



    }

    public async getOrCreateStream(): Promise<Readable> {
        // If stream exists and is still valid, return it
        if (this.currentLogStream && !this.currentLogStream.destroyed) {
            return this.currentLogStream;
        }

        // Otherwise create a new stream
        const container = await this.getHytaleContainer();
        const stream = await container.logs({
            follow: true,
            tail: 1000,
            stdout: true,
            stderr: true
        }) as Readable;

        // Store logs in history
        stream.on('data', (chunk: Buffer) => {
            this.addToHistory(chunk)
        })

        // Handle stream errors and cleanup
        stream.on('error', () => {
            this.currentLogStream = null;
        });

        stream.on('end', () => {
            this.currentLogStream = null;
        });

        this.currentLogStream = stream;
        return stream;
    }

    public async streamLogs(): Promise<Readable> {
        return this.getOrCreateStream();
    }
}

export default new DockerService()