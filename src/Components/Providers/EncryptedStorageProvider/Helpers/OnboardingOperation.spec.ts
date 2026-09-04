import { runOnboardingOperationOnce } from "./OnboardingOperation"

describe("runOnboardingOperationOnce", () => {
    it("shares one in-flight creation and accepts another after completion", async () => {
        let release!: () => void
        const firstOperation = jest.fn(
            () =>
                new Promise<void>(resolve => {
                    release = resolve
                }),
        )
        const duplicateOperation = jest.fn().mockResolvedValue(undefined)

        const first = runOnboardingOperationOnce(firstOperation)
        const duplicate = runOnboardingOperationOnce(duplicateOperation)

        expect(first).toBe(duplicate)
        expect(firstOperation).toHaveBeenCalledTimes(1)
        expect(duplicateOperation).not.toHaveBeenCalled()

        release()
        await first

        await runOnboardingOperationOnce(duplicateOperation)
        expect(duplicateOperation).toHaveBeenCalledTimes(1)
    })
})
