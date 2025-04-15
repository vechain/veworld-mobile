import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { mapVBDDappToDiscoveryDapp, sortVBDDapps } from "./vbd.functions"
import { URIUtils } from "~Utils"
import moment from "moment"

const buildDapp = (overrides?: Partial<VeBetterDaoDapp & VeBetterDaoDAppMetadata>) => ({
    app_urls: [],
    banner: "ipfs://123",
    createdAtTimestamp: new Date().toISOString(),
    description: "DESC",
    external_url: "https://vechain.org",
    id: "VBD_ID",
    logo: "ipfs://123",
    metadataURI: "ipfs://234",
    name: "DAPP NAME",
    screenshots: [],
    social_urls: [],
    teamWalletAddress: "0x0",
    appAvailableForAllocationVoting: true,
    ...overrides,
})

describe("VBD functions", () => {
    it("should map VBD dapp to discovery dapp", async () => {
        const dapp = buildDapp({ logo: "ipfs://baf1" })
        const result = mapVBDDappToDiscoveryDapp(dapp)

        expect(result).toStrictEqual({
            name: dapp.name,
            href: new URL(dapp.external_url).origin,
            desc: dapp.description,
            createAt: new Date(dapp.createdAtTimestamp).getTime(),
            isCustom: false,
            amountOfNavigations: 0,
            isVeWorldSupported: true,
            veBetterDaoId: dapp.id,
            tags: ["__vebetterdao__internal"],
            iconUri: URIUtils.convertUriToUrl(dapp.logo),
        })
    })
    it("should sort VBD dapps by alphabetic_asc correctly", async () => {
        const dapp1 = buildDapp({ name: "A" })
        const dapp2 = buildDapp({ name: "b" })
        const arr = [dapp1, dapp2]
        const sorted = arr.sort(sortVBDDapps("alphabetic_asc"))
        expect(sorted[0].name).toBe("A")
        expect(sorted[1].name).toBe("b")
    })
    it("should sort VBD dapps by alphabetic_desc correctly", async () => {
        const dapp1 = buildDapp({ name: "A" })
        const dapp2 = buildDapp({ name: "b" })
        const arr = [dapp1, dapp2]
        const sorted = arr.sort(sortVBDDapps("alphabetic_desc"))
        expect(sorted[0].name).toBe("b")
        expect(sorted[1].name).toBe("A")
    })
    it("should sort VBD dapps by newest correctly", async () => {
        const dapp1 = buildDapp({
            name: "Should be last",
            createdAtTimestamp: moment().subtract(1, "day").toISOString(),
        })
        const dapp2 = buildDapp({ name: "Should be first", createdAtTimestamp: moment().toISOString() })
        const arr = [dapp1, dapp2]
        const sorted = arr.sort(sortVBDDapps("newest"))
        expect(sorted[0].name).toBe("Should be first")
        expect(sorted[1].name).toBe("Should be last")
    })
})
