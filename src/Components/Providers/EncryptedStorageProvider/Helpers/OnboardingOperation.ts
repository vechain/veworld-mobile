import { ERROR_EVENTS } from "~Constants"
import { debug } from "~Utils"

let onboardingOperationInFlight: Promise<void> | undefined

/**
 * Single-flight latch for onboarding operations. While one is in flight, further
 * calls are logged no-ops — NOT handed the in-flight promise — so a second caller
 * (possibly with different arguments) can never mistake the first operation's
 * result for its own. The AppLoader overlay blocks the UI for the duration.
 *
 * Deliberately no timeout: a biometric/keychain prompt can legitimately stay open
 * for minutes, and a keychain promise that never settles is unrecoverable
 * app-wide regardless of what this latch does.
 */
export const runOnboardingOperationOnce = (operation: () => Promise<void>): Promise<void> => {
    if (onboardingOperationInFlight) {
        debug(ERROR_EVENTS.APP, "onboarding_operation_already_in_flight")
        return Promise.resolve()
    }

    const currentOperation = operation().finally(() => {
        if (onboardingOperationInFlight === currentOperation) onboardingOperationInFlight = undefined
    })

    onboardingOperationInFlight = currentOperation
    return currentOperation
}

/** Test-only: clears the module-level latch so specs stay isolated. */
export const resetOnboardingOperation = () => {
    onboardingOperationInFlight = undefined
}
