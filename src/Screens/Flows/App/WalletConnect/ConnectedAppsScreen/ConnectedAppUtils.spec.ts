import { mapConnectedApps } from "./ConnectedAppUtils"

function betterExpectCheck<TValue, TResult extends TValue>(value: TValue, result: TResult): asserts value is TResult {
    expect(value).toBe(result)
}

describe("ConnectedAppUtils", () => {
    describe("mapConnectedApps", () => {
        it("should return a dapp if it is found in the available dapps", () => {
            const dapp = {
                amountOfNavigations: 0,
                createAt: Date.now(),
                href: "https://vechain.org",
                isCustom: false,
                name: "NAME",
            }
            const result = mapConnectedApps([{ href: "vechain.org", connectedTime: Date.now(), name: "TEST" }], [dapp])

            expect(result).toHaveLength(1)
            betterExpectCheck(result[0].type, "in-app")
            expect(result[0].app).toBe(dapp)
        })
        it("should return a just built dapp if it cannot find any dapp", () => {
            const dapp = {
                amountOfNavigations: 0,
                createAt: Date.now(),
                href: "https://stargate.vechain.org",
                isCustom: false,
                name: "NAME",
            }
            const result = mapConnectedApps([{ href: "vechain.org", connectedTime: Date.now(), name: "TEST" }], [dapp])

            expect(result).toHaveLength(1)
            betterExpectCheck(result[0].type, "in-app")
            expect(result[0].app.name).toBe("TEST")
            expect(result[0].app.href).toBe("https://vechain.org")
            expect(result[0].app.desc).toBe("https://vechain.org")
            expect(result[0].app.isCustom).toBe(true)
            expect(result[0].app.createAt).toStrictEqual(expect.any(Number))
            expect(result[0].app.amountOfNavigations).toBe(1)
        })
    })
})
