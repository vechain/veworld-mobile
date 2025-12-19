import { trimUndefined } from "./ObjectUtils"

describe("ObjectUtils", () => {
    describe("trimUndefined", () => {
        it("should trim undefined values", () => {
            expect(trimUndefined({ a: "1", b: undefined, c: undefined, d: "2" })).toStrictEqual({
                a: "1",
                d: "2",
            })
        })
    })
})
