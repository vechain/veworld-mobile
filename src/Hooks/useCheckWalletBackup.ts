import { useEffect, useState } from "react"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"

export const useCheckWalletBackup = (account: AccountWithDevice) => {
    // check cache if user has already been asked for backup
    // check if device has been backed up
    // check if device type is local mnemonic
    // check if cloud is available?
    const [isShowBackupModal, setIsShowBackupModal] = useState(false)

    useEffect(() => {
        if (
            account.device?.isBuckedUp !== undefined &&
            !account.device?.isBuckedUp &&
            account.device?.type === DEVICE_TYPE.LOCAL_MNEMONIC
        ) {
            // show backup modal
            setIsShowBackupModal(true)
        } else {
            setIsShowBackupModal(false)
        }
    }, [account.device?.isBuckedUp, account.device?.type])

    return isShowBackupModal
}
