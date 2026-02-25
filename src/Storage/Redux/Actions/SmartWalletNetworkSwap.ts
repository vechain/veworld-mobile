import { createAction } from "@reduxjs/toolkit"
import { DEVICE_TYPE, SmartWalletDevice } from "~Model"
import { AddressUtils } from "~Utils"
import { AppThunk } from "../Types"

export interface SmartWalletSwapPayload {
    oldRootAddress: string
    newRootAddress: string
}

/**
 * Shared action handled by both DeviceSlice and AccountSlice via extraReducers.
 * A single dispatch atomically updates both slices, ensuring rootAddress
 * never goes out of sync between devices and accounts.
 */
export const swapSmartWalletNetwork = createAction<SmartWalletSwapPayload>("smartWallet/swapNetwork")

/**
 * Dispatched by LinkedProviderSync when SmartWalletProvider reports
 * a new smartAccountAddress after a network switch.
 *
 * Finds the existing SmartWalletDevice and dispatches a single action
 * that atomically updates both Device and Account slices.
 */
export const handleSmartWalletNetworkSwap =
    (newSmartAccountAddress: string): AppThunk<void> =>
    (dispatch, getState) => {
        const devices = getState().devices
        const smartDevice = devices.find((d): d is SmartWalletDevice => d.type === DEVICE_TYPE.SMART_WALLET)

        if (!smartDevice) return

        // If the address hasn't changed, nothing to do
        if (AddressUtils.compareAddresses(smartDevice.rootAddress, newSmartAccountAddress)) return

        dispatch(
            swapSmartWalletNetwork({
                oldRootAddress: smartDevice.rootAddress,
                newRootAddress: newSmartAccountAddress,
            }),
        )
    }
