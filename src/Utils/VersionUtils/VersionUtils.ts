function compareSemanticVersions(version1: string, version2: string) {
    // Regular expression to validate the semantic version format
    const semVerPattern = /^\d+(\.\d+){0,2}$/

    // Function to validate and parse a version string
    function parseVersion(version: string) {
        if (!semVerPattern.test(version)) {
            return null // Invalid version format
        }
        // Split the version string into its numeric components
        return version.split(".").map(Number)
    }

    const parsedVersion1 = parseVersion(version1)
    const parsedVersion2 = parseVersion(version2)

    if (!parsedVersion1 || !parsedVersion2) {
        throw new Error("Invalid version format. Versions should be in x.x.x, x.x, or x format.")
    }

    // Compare the versions component-wise
    for (let i = 0; i < 3; i++) {
        const part1 = parsedVersion1[i] || 0
        const part2 = parsedVersion2[i] || 0

        if (part1 > part2) {
            return 1
        } else if (part1 < part2) {
            return -1
        }
    }

    return 0
}

export default { compareSemanticVersions }
