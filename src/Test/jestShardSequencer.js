const Sequencer = require("@jest/test-sequencer").default
const path = require("path")
const timings = require("./jestShardTimings.json")

const recorded = Object.values(timings).sort((a, b) => a - b)
const fallback = recorded[Math.floor(recorded.length / 2)] ?? 1

// Jest's default shard() splits by path hash, which left CI shards up to 1.7x apart.
// Pack longest-first onto the lightest shard using CI durations from
// scripts/update-jest-shard-timings.mjs; files without a timing count as the median.
class ShardSequencer extends Sequencer {
    shard(tests, { shardIndex, shardCount }) {
        const weight = test => timings[path.relative(test.context.config.rootDir, test.path)] ?? fallback
        const loads = new Array(shardCount).fill(0)
        return [...tests]
            .sort((a, b) => weight(b) - weight(a) || a.path.localeCompare(b.path))
            .filter(test => {
                const lightest = loads.indexOf(Math.min(...loads))
                loads[lightest] += weight(test)
                return lightest === shardIndex - 1
            })
    }
}

module.exports = ShardSequencer
