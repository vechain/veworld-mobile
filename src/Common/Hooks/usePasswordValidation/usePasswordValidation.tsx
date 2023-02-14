import { useCallback, useMemo } from "react"
import { CryptoUtils, PasswordUtils } from "~Common/Utils"
import KeychainService from "~Services/KeychainService"
import { Device, useStoreQuery } from "~Storage"

export const usePasswordValidation = () => {
    // todo: this is a workaround until the new version is installed
    const result1 = useStoreQuery(Device)
    const devices = useMemo(() => result1.sorted("rootAddress"), [result1])

    const validatePassword = useCallback(
        async (userPassword: string[]) => {
            const accessControl = false

            try {
                // Get key of first device - index of device not important -
                let encryptedKey = await KeychainService.getEncryptionKey(
                    devices[0].index,
                    accessControl,
                )

                // Confirm that user can decrypt encryption key with provided password
                if (encryptedKey) {
                    const hashedKey = PasswordUtils.hash(userPassword.join(""))
                    let encKey = CryptoUtils.decrypt<string>(
                        encryptedKey,
                        hashedKey,
                    )

                    if (encKey) {
                        return true
                    }

                    return false
                }
            } catch (error) {
                console.log(error)
            }
        },

        [devices],
    )

    return { validatePassword }
}
