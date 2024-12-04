import { useMemo } from "react"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { PlatformUtils } from "~Utils"

export const useCheckWalletBackup = (account: AccountWithDevice) => {
    // check cache if user has already been asked for backup
    // check if device has been backed up
    // check if device type is local mnemonic
    // check if cloud is available?
    // const [isShowBackupModal, setIsShowBackupModal] = useState(false)

    const isShowBackupModal = useMemo(() => {
        const isBackedUpManually = account.device?.isBackedUpManual !== undefined && account.device?.isBackedUpManual
        const isBackupCloud = account.device?.isBuckedUp !== undefined && account.device?.isBuckedUp
        const isLocalMnemonic = account.device?.type === DEVICE_TYPE.LOCAL_MNEMONIC
        return PlatformUtils.isAndroid()
            ? !isBackedUpManually && isLocalMnemonic
            : !isBackedUpManually && !isBackupCloud && isLocalMnemonic
    }, [account.device?.isBackedUpManual, account.device?.isBuckedUp, account.device?.type])

    return isShowBackupModal
}
