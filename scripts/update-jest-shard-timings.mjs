// Refreshes src/Test/jestShardTimings.json from a CI run's jest-results-* artifacts.
// Usage: node scripts/update-jest-shard-timings.mjs <run-id>
import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const runId = process.argv[2]
if (!runId) {
    console.error("Usage: node scripts/update-jest-shard-timings.mjs <run-id>")
    process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), "jest-timings-"))
execFileSync("gh", ["run", "download", runId, "--pattern", "jest-results-*", "--dir", dir], { stdio: "inherit" })

// CI paths are absolute to the runner's checkout; keep the shortest suffix that exists here.
const toRepoPath = name => {
    const parts = name.split("/")
    for (let i = 1; i < parts.length; i++) {
        const candidate = parts.slice(i).join("/")
        if (existsSync(candidate)) return candidate
    }
}

const timings = {}
for (const artifact of readdirSync(dir)) {
    for (const file of readdirSync(join(dir, artifact))) {
        for (const result of JSON.parse(readFileSync(join(dir, artifact, file), "utf8")).testResults) {
            const repoPath = toRepoPath(result.name)
            if (repoPath) timings[repoPath] = Math.round((result.endTime - result.startTime) / 100) / 10
        }
    }
}

const sorted = Object.fromEntries(Object.entries(timings).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync("src/Test/jestShardTimings.json", JSON.stringify(sorted, null, 4) + "\n")
console.log(`Wrote ${Object.keys(sorted).length} timings`)
