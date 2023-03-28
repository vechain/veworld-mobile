import { useCallback } from "react"
import { CryptoUtils, WalletSecurity, useWalletSecurity } from "~Common"
import { UserSelectedSecurityLevel } from "~Model"
import { useAppDispatch, useAppSelector } from "~Storage/Redux"
import { setUserSelectedSecurity, updateDevice } from "~Storage/Redux/Actions"
import { getDevices } from "~Storage/Redux/Selectors"

export const useSecurityUpgrade = () => {
    const { walletSecurity } = useWalletSecurity()
    const devices = useAppSelector(getDevices())

    const dispatch = useAppDispatch()

    const runSecurityUpgrade = useCallback(
        async (password: string, onSuccessCallback?: () => void) => {
            if (walletSecurity === WalletSecurity.BIO_UNLOCK) return

            for (const device of devices) {
                const { decryptedWallet } = await CryptoUtils.decryptWallet({
                    device,
                    userPassword: password,
                })

                const { encryptedWallet: updatedEncryptedWallet } =
                    await CryptoUtils.encryptWallet({
                        wallet: decryptedWallet,
                        rootAddress: device.rootAddress,
                        accessControl: true,
                    })

                dispatch(
                    updateDevice({
                        rootAddress: device.rootAddress,
                        device: {
                            ...device,
                            wallet: updatedEncryptedWallet,
                        },
                    }),
                )
            }

            dispatch(
                setUserSelectedSecurity(UserSelectedSecurityLevel.BIOMETRIC),
            )

            onSuccessCallback && onSuccessCallback()
        },
        [walletSecurity, dispatch, devices],
    )

    return runSecurityUpgrade
}
