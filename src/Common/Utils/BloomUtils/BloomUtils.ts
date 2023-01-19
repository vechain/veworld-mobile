// import { newFilter } from "@vechain/connex-driver/dist/bloom"
// import HexUtils from "../HexUtils"

// /**
//  * Test the bloom filter for the provided address
//  * @param bloom - the bloom filter
//  * @param k - the number of hash functions for bloom filter  3
//  * @param address - the address to test
//  * @returns a boolean that is false if the address *isn't* in the data set represented by the bloom filter and true if it *might* be
//  */
// const testBloomForAddress = (bloom: string, k: number, address: string) => {
//     bloom = HexUtils.removePrefix(bloom)
//     address = HexUtils.removePrefix(address)

//     const bloomFilter = newFilter(Buffer.from(bloom, "hex"), k)

//     return testBytesHex(bloomFilter, address)
// }

// /**
//  * Below function lifted from @vechain/connex-driver
//  *    https://github.com/vechain/connex/blob/master/packages/driver/src/cache.ts#L239
//  */
// const testBytesHex = (filter: ReturnType<typeof newFilter>, hex: string) => {
//     let buf = Buffer.from(hex, "hex")
//     const nzIndex = buf.findIndex(v => v !== 0)
//     if (nzIndex < 0) {
//         buf = Buffer.alloc(0)
//     } else {
//         buf = buf.subarray(nzIndex)
//     }
//     return filter.contains(buf)
// }

// export default {
//     testBloomForAddress,
// }
