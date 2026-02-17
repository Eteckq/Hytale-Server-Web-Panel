export function sanitizePath(path: string) {
    path = path.replace(/[^\w\/.-]/g, '')
    if (path.includes('..')) {
        throw new Error('Invalid path')
    }
    return path
}

export function sanitizeFilename(filename: string) {
    filename = filename.replace(/[^\w.-]/g, '')
    if (filename.includes('..')) {
        throw new Error('Invalid filename')
    }
    return filename
}