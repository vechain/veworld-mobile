import { Keychain } from "~Storage"

type VerifySlot = {
    key: string
    /** The exact ciphertext that was just written to the slot. */
    expectedCiphertext: string
}

/**
 * Commit a freshly written encryption key: optionally verify the write, then delete
 * the alternate (PIN vs biometric) slot so only one credential survives.
 *
 * Verification reads the slot back WITHOUT decrypting and compares raw ciphertext,
 * so it neither triggers an OS auth prompt nor pays a second scrypt pass.
 *
 * `verifySlot` must be omitted for the biometric slot: any read of a slot stored
 * with ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE shows an OS auth prompt, and
 * Keychain.set already throws when the write fails.
 */
const commitVerifiedKeys = async ({
    verifySlot,
    alternateSlotKey,
}: {
    verifySlot?: VerifySlot
    alternateSlotKey: string
}) => {
    if (verifySlot) {
        const storedCiphertext = await Keychain.get({ key: verifySlot.key })

        if (storedCiphertext !== verifySlot.expectedCiphertext) {
            throw new Error("Encryption key verification failed")
        }
    }

    await Keychain.deleteItem({ key: alternateSlotKey })
}

export default { commitVerifiedKeys }
