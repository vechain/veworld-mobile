import { useMemo } from "react"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { PlatformUtils } from "~Utils"
import { useSmartWallet } from "./useSmartWallet"

export const useCheckWalletBackup = (account: AccountWithDevice) => {
    const { linkedAccounts } = useSmartWallet()
    // check cache if user has already been asked for backup
    // check if device has been backed up
    // check if device type is local mnemonic
    // check if cloud is available?
    // const [isShowBackupModal, setIsShowBackupModal] = useState(false)

    const isShowBackupModal = useMemo(() => {
        // const isBackedUpManually = account.device?.isBackedUpManual !== undefined && account.device?.isBackedUpManual
        // const isBackupCloud = account.device?.isBuckedUp !== undefined && account.device?.isBuckedUp
        // const isLocalMnemonic = account.device?.type === DEVICE_TYPE.LOCAL_MNEMONIC
        const isSmartWallet = account.device?.type === DEVICE_TYPE.SMART_WALLET

        // if smart wallet and ios, check if user has multiple socials linked
        // only on ios because android doesn't support multiple socials at the moment
        if (isSmartWallet) {
            return !linkedAccounts.length && PlatformUtils.isIOS()
        }

        // return PlatformUtils.isAndroid()
        //     ? !isBackedUpManually && isLocalMnemonic
        //     : !isBackedUpManually && !isBackupCloud && isLocalMnemonic
    }, [account.device?.type, linkedAccounts])

    return isShowBackupModal
}
