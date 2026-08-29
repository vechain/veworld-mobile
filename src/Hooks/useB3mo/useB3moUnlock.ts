import { useCallback } from "react"
import { WalletEncryptionKeyHelper } from "~Components/Providers/EncryptedStorageProvider/Helpers"
import { setB3moSessionPassword, useAppDispatch } from "~Storage/Redux"

export const useB3moUnlock = () => {
    const dispatch = useAppDispatch()

    const unlock = useCallback(
        async (pinCode?: string): Promise<string> => {
            const { walletKey } = await WalletEncryptionKeyHelper.get({ pinCode })
            dispatch(setB3moSessionPassword({ password: walletKey }))
            return walletKey
        },
        [dispatch],
    )

    return { unlock }
}
