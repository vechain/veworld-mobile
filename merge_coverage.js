"use strict"

const { spawnSync } = require("child_process")
const path = require("path")
const glob = require("glob")
const makeDir = require("make-dir")
const rimraf = require("rimraf")

process.chdir(__dirname)
rimraf.sync(".nyc_output")
makeDir.sync(".nyc_output")

// Merge coverage data from each executor.
glob.sync(".nyc_output_temp/*/nyc_output").forEach(nycOutput => {
    // eslint-disable-next-line no-console
    console.log(`Merging: ${nycOutput}`)
    const cwd = path.dirname(nycOutput)
    const { status } = spawnSync(
        "npx nyc",
        [
            "merge",
            "nyc_output",
            path.join(__dirname, ".nyc_output", path.basename(cwd) + ".json"),
        ],
        {
            encoding: "utf8",
            shell: true,
            cwd,
        },
    )

    if (status !== 0) {
        process.exit(status)
    }
})
