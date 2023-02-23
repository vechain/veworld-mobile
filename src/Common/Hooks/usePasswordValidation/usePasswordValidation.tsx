import { useCallback, useMemo } from "react"
import { CryptoUtils, PasswordUtils } from "~Common/Utils"
import KeychainService from "~Services/KeychainService"
import { Device, useStoreQuery } from "~Storage"

export const usePasswordValidation = () => {
    const deviceQuery = useStoreQuery(Device)
    const devices = useMemo(
        () => deviceQuery.sorted("rootAddress"),
        [deviceQuery],
    )

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
                return false
            }
        },

        [devices],
    )

    return { validatePassword }
}
