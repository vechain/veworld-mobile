import { assertMultipleClausesCallSuccess } from "./ThorClauseUtils"

describe("ThorClauseUtils", () => {
    describe("assertMultipleClausesCallSuccess", () => {
        it("should fail with at least one error", () => {
            expect(() =>
                assertMultipleClausesCallSuccess(
                    [
                        { success: false, result: { errorMessage: "" } },
                        { success: true, result: { plain: 1n, array: [1n] } },
                    ],
                    () => {
                        throw new Error("CLAUSES REVERTED, PLEASE CHECK")
                    },
                ),
            ).toThrow("CLAUSES REVERTED, PLEASE CHECK")
        })
        it("should not fail with all success", () => {
            expect(() =>
                assertMultipleClausesCallSuccess(
                    [
                        { success: true, result: { plain: 2n, array: [2n] } },
                        { success: true, result: { plain: 1n, array: [1n] } },
                    ],
                    () => {
                        throw new Error("CLAUSES REVERTED, PLEASE CHECK")
                    },
                ),
            ).not.toThrow("CLAUSES REVERTED, PLEASE CHECK")
        })
    })
})
