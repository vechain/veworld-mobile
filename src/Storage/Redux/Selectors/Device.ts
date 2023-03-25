import { createSelector } from "@reduxjs/toolkit"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "../Types"

const selectAll = (state: RootState) => state
const selectDevices = (state: RootState) => state.devices

/**
 *
 * @returns true if the user has onboarded, false otherwise
 *  a user has onboarded if they have at least one device and have selected an account
 */
export const hasOnboarded = createSelector(selectAll, state => {
    return state.devices.length > 0 && state.accounts.selectedAccount
})

/**
 *
 * @param rootAddress rootAddress of device to get
 * @returns the device with the given rootAddress
 */
export const getDevice = (rootAddress: string) =>
    createSelector(selectDevices, state => {
        return state.find(device => device.rootAddress === rootAddress)
    })

/**
 *
 * @param type optional type to filter devices by
 * @returns all devices of the given type or all devices if no type is given
 */
export const getDevices = (type?: DEVICE_TYPE) =>
    createSelector(selectDevices, state => {
        if (!type) return state
        return state.filter(device => device.type === type)
    })
