import { BaseDevice } from "~Model"
import { useCallback } from "react"
import { useDispatch } from "react-redux"
import {
    removeAccountsByDevice,
    removeBalancesByAddress,
    removeDevice,
    selectAccounts,
    selectAccountsByDevice,
    selectDevices,
    selectSelectedAccount,
    selectSelectedNetwork,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils } from "~Utils"
import { useSetSelectedAccount, useSmartWallet } from "~Hooks"

export const useWalletDeletion = (device?: BaseDevice) => {
    const devices = useAppSelector(selectDevices)
    const allAccounts = useAppSelector(selectAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const accountsByDevice = useAppSelector(state => selectAccountsByDevice(state, device?.rootAddress))
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { logout } = useSmartWallet()
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
        // Remove balances for all accounts in the device
        dispatch(
            removeBalancesByAddress({
                network: selectedNetwork.type,
                accountAddress: accountsByDevice.map(account => account.address),
            }),
        )
    }, [
        allAccounts,
        device,
        dispatch,
        onSetSelectedAccount,
        selectedAccount.rootAddress,
        accountsByDevice,
        selectedNetwork.type,
    ])

    const deleteWallet = useCallback(async () => {
        if (!device?.rootAddress) return

        if (AccountUtils.isObservedAccount(device)) {
            removeFromStorage()
        } else if (AccountUtils.isSmartWalletAccount(device)) {
            if (devices.length <= 1) throw new Error("Cannot delete the last device!")
            await logout()
            removeFromStorage()
        } else {
            if (devices.length <= 1) throw new Error("Cannot delete the last device!")
            removeFromStorage()
        }
    }, [device, removeFromStorage, devices.length, logout])

    return {
        deleteWallet,
    }
}
