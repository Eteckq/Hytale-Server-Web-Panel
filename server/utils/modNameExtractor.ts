/**
 * Extracts the mod name from a filename by removing the extension and version.
 * 
 * Examples:
 * - EasyWebMap-v1.0.14.zip => EasyWebMap
 * - SimpleChestManager1.0.2.jar => SimpleChestManager
 * - The_Weavers_Loom-1.1.0.zip => The_Weavers_Loom
 * - TorchesPlus_-_2026.01.jar => TorchesPlus
 * 
 * @param filename - The full filename including extension
 * @returns The extracted mod name without version and extension
 */
export function extractModName(filename: string): string {
    // Remove file extension (.zip or .jar)
    const withoutExtension = filename.replace(/\.(zip|jar)$/i, '')
    
    // Pattern to match version indicators:
    // - Dash followed by 'v' and digits (e.g., -v1.0.14)
    // - Dash followed directly by digits (e.g., -1.1.0)
    // - Underscores/dashes followed by digits (e.g., _-_2026.01)
    // - Direct digits after the name (e.g., 1.0.2)
    const versionPattern = /[-_]*(?:v)?\d+(?:\.\d+)*(?:[-_]\d+(?:\.\d+)*)?$/
    
    // Remove version part
    const modName = withoutExtension.replace(versionPattern, '')
    
    return modName
}

/**
 * Extracts the version from a mod filename.
 * 
 * Examples:
 * - EasyWebMap-v1.0.14.zip => v1.0.14
 * - SimpleChestManager1.0.2.jar => 1.0.2
 * - The_Weavers_Loom-1.1.0.zip => 1.1.0
 * - TorchesPlus_-_2026.01.jar => 2026.01
 * 
 * @param filename - The full filename including extension
 * @returns The extracted version string, or null if no version is found
 */
export function extractModVersion(filename: string): string | null {
    // Remove file extension (.zip or .jar)
    const withoutExtension = filename.replace(/\.(zip|jar)$/i, '')
    
    // Pattern to match version:
    // - Dash followed by 'v' and digits (e.g., -v1.0.14)
    // - Dash followed directly by digits (e.g., -1.1.0)
    // - Underscores/dashes followed by digits (e.g., _-_2026.01)
    // - Direct digits after the name (e.g., 1.0.2)
    const versionMatch = withoutExtension.match(/[-_]*(v?\d+(?:\.\d+)*(?:[-_]\d+(?:\.\d+)*)?)$/)
    
    if (!versionMatch) {
        return null
    }
    
    // Extract the version part (group 1 contains the version without leading separators)
    // But we want to keep the 'v' prefix if present, so we extract from the match
    const fullMatch = versionMatch[0]
    const version = fullMatch.replace(/^[-_]+/, '') // Remove leading separators
    
    return version || null
}
