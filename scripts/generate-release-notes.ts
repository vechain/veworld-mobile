const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const RELEASES_DIR = path.resolve(__dirname, "..", "releases")
const PLATFORMS = ["ios", "android"]

function getVersionFromBranch(): string {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf-8",
    }).trim()

    const match = branch.match(/(\d+\.\d+\.\d+)/)
    if (!match) {
        throw new Error(
            `Could not extract version from branch name: "${branch}". Expected format: release/ios-X.Y.Z-android-X.Y.Z`,
        )
    }
    return match[1]
}

function updateVersionFile(platform: string, version: string, enStrings: string[]) {
    const filePath = path.join(RELEASES_DIR, platform, "versions", `${version}.json`)

    if (!fs.existsSync(filePath)) {
        throw new Error(`Version file not found: ${filePath}`)
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    data.descriptions.en = enStrings
    data.major = true

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + "\n", "utf-8")
    console.log(`Updated ${filePath}`)
}

function updateManifest(platform: string) {
    const filePath = path.join(RELEASES_DIR, platform, "manifest.json")

    if (!fs.existsSync(filePath)) {
        throw new Error(`Manifest file not found: ${filePath}`)
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    data.major = data.latest

    const historyEntry = data.history.find((h: { version: string }) => h.version === data.latest)
    if (historyEntry) {
        historyEntry.major = true
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4) + "\n", "utf-8")
    console.log(`Updated ${filePath} (major set to "${data.latest}")`)
}

function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.error('Usage: yarn generate:notes "Feature one" "Feature two" ...')
        process.exit(1)
    }

    const version = getVersionFromBranch()
    console.log(`Detected version: ${version}`)
    console.log(`EN descriptions: ${JSON.stringify(args)}`)

    for (const platform of PLATFORMS) {
        updateVersionFile(platform, version, args)
        updateManifest(platform)
    }

    console.log("\nDone!")
}

main()
