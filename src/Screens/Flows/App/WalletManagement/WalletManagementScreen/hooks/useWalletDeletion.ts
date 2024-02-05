import { BaseDevice } from "~Model"
import { useCallback } from "react"
import { useDispatch } from "react-redux"
import {
    removeAccountsByDevice,
    removeDevice,
    selectAccounts,
    selectDevices,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils } from "~Utils"
import { useSetSelectedAccount } from "~Hooks"

export const useWalletDeletion = (device?: BaseDevice) => {
    const devices = useAppSelector(selectDevices)
    const allAccounts = useAppSelector(selectAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const dispatch = useDispatch()

    const removeFromStorage = useCallback(() => {
        if (!device?.rootAddress) return
        const { rootAddress } = device

        const isSelectedAccountInDevice = AddressUtils.compareAddresses(rootAddress, selectedAccount.rootAddress)

        if (isSelectedAccountInDevice) {
            const otherAccount = allAccounts.filter(
                account => !AddressUtils.compareAddresses(account.rootAddress, rootAddress),
            )

            onSetSelectedAccount(otherAccount[0])
        }

        dispatch(removeAccountsByDevice({ rootAddress }))

        dispatch(removeDevice(device))
    }, [allAccounts, device, dispatch, onSetSelectedAccount, selectedAccount.rootAddress])

    const deleteWallet = useCallback(() => {
        if (!device?.rootAddress) return

        if (AccountUtils.isObservedAccount(device)) {
            removeFromStorage()
        } else {
            if (devices.length <= 1) throw new Error("Cannot delete the last device!")
            removeFromStorage()
        }
    }, [device, removeFromStorage, devices.length])

    return {
        deleteWallet,
    }
}
