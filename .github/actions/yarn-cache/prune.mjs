// Yarn names each cache entry `npm-<name>-<version>-<sha1>-integrity`, where sha1 is
// the `#fragment` of the lockfile's `resolved` URL. Names are slugged, so match on sha1.
import { readdirSync, readFileSync, rmSync } from "node:fs"
import { join } from "node:path"

const [cacheDir, ...lockfiles] = process.argv.slice(2)

const keep = new Set(
    lockfiles.flatMap(file =>
        [...readFileSync(file, "utf8").matchAll(/^ {2}resolved ".*#([0-9a-f]{40})"$/gm)].map(m => m[1]),
    ),
)
if (keep.size === 0) {
    console.error("No resolved entries found in", lockfiles.join(", "))
    process.exit(1)
}

const entries = readdirSync(cacheDir)
let removed = 0
for (const entry of entries) {
    if (keep.has(entry.match(/-([0-9a-f]{40})-integrity$/)?.[1])) continue
    rmSync(join(cacheDir, entry), { recursive: true, force: true })
    removed++
}
console.log(`Pruned ${removed} of ${entries.length} yarn cache entries`)
