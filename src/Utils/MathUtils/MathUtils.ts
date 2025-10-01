const getOdd = (num: number) => {
    return num % 2 !== 0
}

const getEven = (num: number) => {
    return num % 2 === 0
}

/**
 * Create a deterministic random number generator from a seed.
 * @param seed Seed for the random number generator
 * @returns A function that creates a deterministic number
 */
const deterministicRNG = (seed: number) => {
    var m = 2 ** 35 - 31
    var a = 185852
    var s = seed % m
    return function () {
        return (s = (s * a) % m) / m
    }
}

export default { getOdd, getEven, deterministicRNG }
