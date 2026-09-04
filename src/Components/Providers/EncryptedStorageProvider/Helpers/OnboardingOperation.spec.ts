import { resetOnboardingOperation, runOnboardingOperationOnce } from "./OnboardingOperation"

describe("runOnboardingOperationOnce", () => {
    afterEach(() => {
        resetOnboardingOperation()
    })

    it("ignores a second operation while one is in flight and accepts another after completion", async () => {
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

        // The second caller must not receive the in-flight promise: it could be a
        // different operation, and settling would read as its own success.
        expect(duplicate).not.toBe(first)
        await expect(duplicate).resolves.toBeUndefined()
        expect(firstOperation).toHaveBeenCalledTimes(1)
        expect(duplicateOperation).not.toHaveBeenCalled()

        release()
        await first

        await runOnboardingOperationOnce(duplicateOperation)
        expect(duplicateOperation).toHaveBeenCalledTimes(1)
    })

    it("releases the latch when the operation rejects", async () => {
        const failingOperation = jest.fn().mockRejectedValue(new Error("boom"))
        const nextOperation = jest.fn().mockResolvedValue(undefined)

        await expect(runOnboardingOperationOnce(failingOperation)).rejects.toThrow("boom")

        await runOnboardingOperationOnce(nextOperation)
        expect(nextOperation).toHaveBeenCalledTimes(1)
    })
})
