import { TESTNET_NETWORK } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { DAppUtils } from "~Utils"

describe("DAppUtils", () => {
    describe("isValidTxMessage", () => {
        it("bad values should be invalid", () => {
            expect(DAppUtils.isValidTxMessage([])).toBe(false)
            expect(DAppUtils.isValidTxMessage({ test: "Hello World" })).toBe(false)
            expect(DAppUtils.isValidTxMessage(undefined)).toBe(false)
            expect(DAppUtils.isValidTxMessage(["hello", "world"])).toBe(false)
        })

        it("`to` is the wrong type", () => {
            const msg = [{ to: 12341234, value: "0x0", data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("`value` is the wrong type", () => {
            const msg = [{ to: "0x0", value: { blah: "blah" }, data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("`data` is the wrong type", () => {
            const msg = [{ to: "0x0", value: "0x0", data: 12341234 }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("should be a valid message", () => {
            const msg = [{ to: "0x0", value: "0x0", data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(true)
        })
    })

    describe("isValidCertMessage", () => {
        it("bad values should be false", () => {
            expect(DAppUtils.isValidCertMessage(["hello", "world"])).toBe(false)
            expect(DAppUtils.isValidCertMessage(undefined)).toBe(false)
            expect(DAppUtils.isValidCertMessage(null)).toBe(false)
        })

        it("is an object with bad values", () => {
            expect(DAppUtils.isValidCertMessage({})).toBe(false)
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification-bad",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { type: "text" } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { content: "Hello World" } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { type: "text", content: null } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ purpose: "identification", payload: {} })).toBe(false)
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "string", content: "Hello World" },
                }),
            ).toBe(false)
            expect(DAppUtils.isValidCertMessage({ purpose: "identification", payload: { content: "test" } })).toBe(
                false,
            )
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "text", content: "" },
                }),
            ).toBe(false)
        })

        it("is a valid message", () => {
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(true)

            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "agreement",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(true)
        })
    })

    describe("isValidSignedDataMessage", () => {
        const msg = {
            domain: {
                name: "Ether Mail",
                version: "1",
                chainId: "1176455790972829965191905223412607679856028701100105089447013101863",
                verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
            },
            genesisId: TESTNET_NETWORK.genesisBlock.id,
            id: "0x1",
            method: "thor_signTypedData",
            origin: "https://vechain.org",
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                ],
            },
            value: {
                name: "NAME",
                wallet: ethers.Wallet.createRandom().address,
            },
        }
        describe("broken values", () => {
            it("null value", () => expect(DAppUtils.isValidSignedDataMessage(null)).toBe(false))
            it("undefined value", () => expect(DAppUtils.isValidSignedDataMessage(undefined)).toBe(false))
            it("not object value", () => expect(DAppUtils.isValidSignedDataMessage(1)).toBe(false))
            it("array value", () => expect(DAppUtils.isValidSignedDataMessage([1])).toBe(false))
        })
        describe("partial request", () => {
            it("no domain", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "domain"))).toBe(false))
            it("no genesisId", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "genesisId"))).toBe(false))
            it("no id", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "id"))).toBe(false))
            it("no method", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "method"))).toBe(false))
            it("no origin", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "origin"))).toBe(false))
            it("no types", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "types"))).toBe(false))
            it("no value", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "value"))).toBe(false))
        })
        it("invalid chainId", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.chainId", 1n))).toBe(false))
        it("invalid verifyingContract", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.verifyingContract", 1n))).toBe(
                false,
            ))
        it("invalid domain name", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.name", 1n))).toBe(false))
        it("invalid domain version", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.version", 1))).toBe(false))
        it("invalid genesisId", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "genesisId", 1))).toBe(false))
        it("invalid id", () => expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "id", 1))).toBe(false))
        it("invalid method", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "method", "thor_signTransaction"))).toBe(
                false,
            ))
        it("invalid origin", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "origin", 1))).toBe(false))
        it("invalid types", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "types", "TYPES"))).toBe(false))
        it("invalid value", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "value", "VALUE"))).toBe(false))
        it("if everything is valid, it should be true", () =>
            expect(DAppUtils.isValidSignedDataMessage(msg)).toBe(true))
    })

    describe("isValidSignedData", () => {
        const msg = {
            domain: {
                name: "Ether Mail",
                version: "1",
                chainId: "1176455790972829965191905223412607679856028701100105089447013101863",
                verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
            },
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                ],
            },
            value: {
                name: "NAME",
                wallet: ethers.Wallet.createRandom().address,
            },
        }
        describe("broken values", () => {
            it("null value", () => expect(DAppUtils.isValidSignedData(null)).toBe(false))
            it("undefined value", () => expect(DAppUtils.isValidSignedData(undefined)).toBe(false))
            it("not object value", () => expect(DAppUtils.isValidSignedData(1)).toBe(false))
            it("array value", () => expect(DAppUtils.isValidSignedData([1])).toBe(false))
        })
        describe("partial request", () => {
            it("no domain", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "domain"))).toBe(false))
            it("no types", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "types"))).toBe(false))
            it("no value", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "value"))).toBe(false))
        })
        it("invalid chainId", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.chainId", 1n))).toBe(false))
        it("invalid verifyingContract", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.verifyingContract", 1n))).toBe(false))
        it("invalid domain name", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.name", 1n))).toBe(false))
        it("invalid domain version", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.version", 1))).toBe(false))
        it("invalid types", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "types", "TYPES"))).toBe(false))
        it("invalid value", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "value", "VALUE"))).toBe(false))
        it("if everything is valid, it should be true", () => expect(DAppUtils.isValidSignedData(msg)).toBe(true))
    })

    describe("getAppHubIconUrl", () => {
        process.env.REACT_APP_HUB_URL = "https://vechain.github.io/app-hub"

        it("should return a valid icon address", () => {
            expect(DAppUtils.getAppHubIconUrl("vet.cleanify")).toBe(
                "https://vechain.github.io/app-hub/imgs/vet.cleanify.png",
            )
        })
    })

    describe("generateFaviconUrl", () => {
        process.env.REACT_APP_GOOGLE_FAVICON_URL =
            "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=32&&url="
        const encodedUrl =
            "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE%2CSIZE%2CURL&size=48&url="
        it("should return a valid url", () => {
            expect(DAppUtils.generateFaviconUrl("https://vechain.org")).toBe(
                `${encodedUrl}${encodeURIComponent("https://vechain.org")}`,
            )
        })
        it("should return a url with the correct size", () => {
            expect(DAppUtils.generateFaviconUrl("https://vechain.org", { size: 64 })).toBe(
                `${encodedUrl.replace("size=48", "size=64")}${encodeURIComponent("https://vechain.org")}`,
            )
        })
    })
})
