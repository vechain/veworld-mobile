import { createSelector } from "@reduxjs/toolkit"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "../Types"

const reducer = (state: RootState) => state.devices

/**
 *
 * @param rootAddress rootAddress of device to get
 * @returns the device with the given rootAddress
 */
export const getDevice = (rootAddress: string) =>
    createSelector(reducer, state => {
        return state.find(device => device.rootAddress === rootAddress)
    })

/**
 *
 * @param type optional type to filter devices by
 * @returns all devices of the given type or all devices if no type is given
 */
export const getDevices = (type?: DEVICE_TYPE) =>
    createSelector(reducer, state => {
        if (!type) return state
        return state.filter(device => device.type === type)
    })
