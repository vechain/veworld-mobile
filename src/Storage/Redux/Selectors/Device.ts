import { createSelector } from "@reduxjs/toolkit"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "../Types"
import sortBy from "lodash/sortBy"

const selectAll = (state: RootState) => state
export const selectDevicesState = (state: RootState) =>
    sortBy(state.devices, "position")

/**
 *
 * @returns true if the user has onboarded, false otherwise
 *  a user has onboarded if they have at least one device and have selected an account
 */
export const selectHasOnboarded = createSelector(selectAll, state => {
    return state.devices.length > 0 && !!state.accounts.selectedAccount
})

/**
 *
 * @param rootAddress rootAddress of device to get
 * @returns the device with the given rootAddress
 */
export const selectDevice = createSelector(
    [selectDevicesState, (_: RootState, rootAddress?: string) => rootAddress],
    (state, rootAddress) => {
        return state.find(device => device.rootAddress === rootAddress)
    },
)

/**
 *
 * @param type optional type to filter devices by
 * @returns all devices of the given type or all devices if no type is given
 */
export const selectDevices = createSelector(
    [selectDevicesState, (_: RootState, type?: DEVICE_TYPE) => type],
    (state, type) => {
        if (!type) return state
        return state.filter(device => device.type === type)
    },
)

export const selectLedgerDevices = createSelector(selectDevicesState, state => {
    return state.filter(device => device.type === DEVICE_TYPE.LEDGER)
})

export const selectLocalDevices = createSelector(selectDevicesState, state => {
    return state.filter(device => device.type === DEVICE_TYPE.LOCAL_MNEMONIC)
})
