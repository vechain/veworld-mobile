/* eslint-disable jest/no-disabled-tests */
import { veWorldErrors } from "./Errors"
import { VeWorldError } from "./VeWorldError"

// TODO: fix the VeWorldError Object
describe("Expected error messages", () => {
    test.skip("Single parameter with valid i18n key", () => {
        try {
            throw veWorldErrors.rpc.invalidRequest({
                translationKey: "wrong_mnemonic_length",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "The mnemonic should be exactly 12 words",
            )
        }
    })

    test.skip("Throw veWorld error, catch it, throw another - should return original veWorld error", () => {
        try {
            throw veWorldErrors.rpc.invalidRequest({
                translationKey: "wrong_mnemonic_length",
            })
        } catch (e) {
            try {
                throw veWorldErrors.rpc.internal({
                    error: e,
                    translationKey: "failed_to_import_mnemonic",
                })
            } catch (err) {
                expect(VeWorldError.getErrorMessage(err, "Default")).toBe(
                    "The mnemonic should be exactly 12 words",
                )
            }
        }
    })

    test.skip("Throw regular error and catch & throw veWorld error - should be have an 18n key", () => {
        try {
            throw Error("Hello world!")
        } catch (e) {
            try {
                throw veWorldErrors.rpc.internal({
                    error: e,
                    translationKey: "failed_to_import_mnemonic",
                })
            } catch (err) {
                expect(VeWorldError.getErrorMessage(err, "Default")).toBe(
                    "Failed to import the mnemonic",
                )
            }
        }
    })

    test.skip("Hardcoded error message - i18n should be undefined & message should be hardcoded error message", () => {
        try {
            throw veWorldErrors.rpc.internal({
                message: "random hardcoded string",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe("Default")
            const message = (e as VeWorldError).message
            expect(message).toBe("random hardcoded string")
        }
    })

    test.skip("Hardcoded error message with i18n fallback - should contain i18n key and original error message", () => {
        try {
            throw veWorldErrors.rpc.internal({
                message: "Failed to import new wallet",
                translationKey: "failed_to_import_mnemonic",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "Failed to import the mnemonic",
            )
            const message = (e as VeWorldError).message
            expect(message).toBe("Failed to import new wallet")
        }
    })

    test.skip("Unknown error - message should be from unknown error", () => {
        try {
            throw veWorldErrors.rpc.internal(new Error("Hello world!"))
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe("Default")
            const message = (e as VeWorldError).message
            expect(message).toBe("Hello world!")
        }
    })

    test.skip("All parameters passed to veWorld error", () => {
        try {
            throw veWorldErrors.rpc.internal({
                error: new Error("Hello world!"),
                message: "Caught an error",
                translationKey: "failed_to_import_mnemonic",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "Failed to import the mnemonic",
            )
            const message = (e as VeWorldError).message
            expect(message).toBe("Caught an error")
        }
    })

    test.skip("2 parameters passed - message & translation", () => {
        try {
            throw veWorldErrors.rpc.internal({
                message: "Caught an error",
                translationKey: "failed_to_import_mnemonic",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "Failed to import the mnemonic",
            )
            const message = (e as VeWorldError).message
            expect(message).toBe("Caught an error")
        }
    })

    test.skip("2 parameters passed - message & error", () => {
        try {
            throw veWorldErrors.rpc.internal({
                message: "Caught an error",
                error: new Error("Hello world!"),
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe("Default")
            const message = (e as VeWorldError).message
            expect(message).toBe("Caught an error")
        }
    })

    test.skip("2 parameters passed - translation & error", () => {
        try {
            throw veWorldErrors.rpc.internal({
                translationKey: "failed_to_import_mnemonic",
                error: new Error("Hello world!"),
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "Failed to import the mnemonic",
            )
            const message = (e as VeWorldError).message
            expect(message).toBe("Hello world!")
        }
    })

    test.skip("Only message passed", () => {
        try {
            throw veWorldErrors.rpc.internal({
                message: "Hello world!",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe("Default")
            const message = (e as VeWorldError).message
            expect(message).toBe("Hello world!")
        }
    })

    test.skip("Only translation passed", () => {
        try {
            throw veWorldErrors.rpc.internal({
                translationKey: "failed_to_import_mnemonic",
            })
        } catch (e) {
            expect(VeWorldError.getErrorMessage(e, "Default")).toBe(
                "Failed to import the mnemonic",
            )
            const message = (e as VeWorldError).message
            expect(message).toBe("failed_to_import_mnemonic")
        }
    })
})
