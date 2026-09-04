let onboardingOperationInFlight: Promise<void> | undefined

export const runOnboardingOperationOnce = (operation: () => Promise<void>): Promise<void> => {
    if (onboardingOperationInFlight) return onboardingOperationInFlight

    const currentOperation = operation().finally(() => {
        if (onboardingOperationInFlight === currentOperation) onboardingOperationInFlight = undefined
    })

    onboardingOperationInFlight = currentOperation
    return currentOperation
}
