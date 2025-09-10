import { DiscoveryDApp } from "~Constants"
import { Migration27 } from "./Migration27"
import { RootState } from "../Types"

describe("Migration27", () => {
    it("should not do anything on empty state", () => {
        const result = Migration27({
            discovery: {},
        } as any) as unknown as RootState

        expect(result.discovery).toStrictEqual({})
    })

    it("should remove custom dapps", () => {
        const dapp = {
            amountOfNavigations: 0,
            createAt: Date.now(),
            href: "https://vechain.org",
            isCustom: false,
            name: "TEST",
        }
        const result = Migration27({
            discovery: {
                custom: [],
                featured: [dapp] as DiscoveryDApp[],
            },
        } as any) as unknown as RootState

        expect(result.discovery.custom).toStrictEqual([])
        expect(result.discovery.featured).toStrictEqual([dapp])
    })
})
