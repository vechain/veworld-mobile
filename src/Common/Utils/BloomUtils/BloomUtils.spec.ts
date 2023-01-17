import BloomUtils from "./BloomUtils"

test("bloom does not contain", () => {
    const bloom = "0x83dd624059136e3d164d84961d36c6fb5544"
    const k = 13

    const address = "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"

    const bloomResult = BloomUtils.testBloomForAddress(bloom, k, address)

    expect(bloomResult).toBe(false)
})

test("bloom might contain", () => {
    const bloom = "0x23e90e037e1478516170a5815446fe15ca850a3745af5f"
    const k = 13

    const address = "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa"

    const bloomResult = BloomUtils.testBloomForAddress(bloom, k, address)

    expect(bloomResult).toBe(true)
})

test("bloom might contain - no hex", () => {
    const bloom = "23e90e037e1478516170a5815446fe15ca850a3745af5f"
    const k = 13

    const address = "f077b491b355E64048cE21E3A6Fc4751eEeA77fa"

    const bloomResult = BloomUtils.testBloomForAddress(bloom, k, address)

    expect(bloomResult).toBe(true)
})
