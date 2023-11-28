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
})
