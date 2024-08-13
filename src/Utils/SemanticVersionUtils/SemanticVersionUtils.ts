/* eslint-disable radix */
function compareSemanticVersions(version1: string, version2: string) {
    // Regular expression to validate the semantic version format
    const semVerPattern = /^\d+(\.\d+){0,2}$/

    // Function to validate and parse a version string
    function parseVersion(version: string) {
        if (!semVerPattern.test(version)) {
            return null // Invalid version format
        }
        return version.split(".").map(Number)
    }

    const parsedVersion1 = parseVersion(version1)
    const parsedVersion2 = parseVersion(version2)

    if (!parsedVersion1 || !parsedVersion2) {
        throw new Error("Invalid version format. Versions should be in x.x.x, x.x, or x format.")
    }

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

const moreThan = (a: string, b: string): boolean => {
    const aParts = a.split(".")
    const bParts = b.split(".")

    for (let i = 0; i < aParts.length; i++) {
        const aPart = parseInt(aParts[i])
        const bPart = parseInt(bParts[i])

        if (aPart > bPart) {
            return true
        } else if (aPart < bPart) {
            return false
        }
    }

    return false
}

const moreThanOrEqual = (a: string, b: string): boolean => {
    return moreThan(a, b) || a === b
}

export default { compareSemanticVersions, moreThan, moreThanOrEqual }
