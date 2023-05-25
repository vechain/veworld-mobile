import { sanifySeed } from "./Seed"

describe("sanifySeed", () => {
    it("should return correct seed", () => {
        expect(sanifySeed("foo    bar  \n foo")).toEqual(["foo", "bar", "foo"])
    })
})
