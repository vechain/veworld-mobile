// // import { AddressUtils, debug, error, veWorldErrors } from "~Common"
// // import { DEVICE_TYPE, Device, DeviceStorageData } from "~Model"
// // import AccountService from "~Services/AccountService"
// // import { AppThunk, updateDevice } from "~Storage/Caches"
// // import { DeviceStore } from "~Storage/Stores"

// import { AsyncStoreType, error } from "~Common"
// import { Device } from "~Model"
// import { AppThunk, setDevices } from "~Storage/Caches"
// import { AsyncStore } from "~Storage/Stores"

// // /**
// //  * Returns the devices from the store
// //  * @returns return the devices from the store
// //  */
// // const get = async (): Promise<DeviceStorageData> => {
// //     return await DeviceStore.get()
// // }

// // /**
// //  * Update the device store and cache
// //  * @param deviceUpdate - the update to apply to the devices
// //  */
// // const update =
// //     (
// //         deviceUpdate: (storage: DeviceStorageData) => void,
// //     ): AppThunk<Promise<void>> =>
// //     async dispatch => {
// //         debug("Updating a device")

// //         try {
// //             // Update & Get the result
// //             const upd = await DeviceStore.update([deviceUpdate])
// //             //Update the cache
// //             dispatch(updateDevice(upd.devices))
// //         } catch (e) {
// //             error(e)
// //             throw veWorldErrors.rpc.internal({
// //                 error: e,
// //                 message: "Failed to update devices",
// //             })
// //         }
// //     }

// // /**
// //  * Reset the device store and cache
// //  */
// // const reset = (): AppThunk<Promise<void>> => async dispatch => {
// //     debug("Resetting devices")

// //     try {
// //         await DeviceStore.insert({ devices: [] })
// //         dispatch(updateDevice([]))
// //     } catch (e) {
// //         error(e)
// //         throw veWorldErrors.rpc.internal({
// //             error: e,
// //             message: "Failed to reset devices",
// //         })
// //     }
// // }

// // /**
// //  * Initialise the cache from the store
// //  */
// // const initialiseCache = (): AppThunk<Promise<void>> => async dispatch => {
// //     debug("Initialising devices cache")

// //     try {
// //         const storage = await get()
// //         dispatch(updateDevice(storage.devices))
// //     } catch (e) {
// //         error(e)
// //         throw veWorldErrors.rpc.internal({
// //             error: e,
// //             message: "Failed to initialise devices cache",
// //         })
// //     }
// // }

// // /**
// //  * Add a new device
// //  * @param newDevice - the device to add
// //  */
// // const add =
// //     (newDevice: Device): AppThunk<Promise<void>> =>
// //     async dispatch => {
// //         debug("Adding a device")

// //         try {
// //             const existing = await DeviceStore.exists()
// //             //If it doesn't exist, create it
// //             if (!existing) {
// //                 await DeviceStore.insert({ devices: [newDevice] })
// //                 dispatch(updateDevice([newDevice]))
// //                 return
// //             }

// //             const deviceUpdate = (storage: DeviceStorageData) => {
// //                 //If the current Devices already contain the ledger public key - don't add the device
// //                 if (
// //                     storage.devices.some(
// //                         device => device.rootAddress === newDevice.rootAddress,
// //                     )
// //                 ) {
// //                     throw veWorldErrors.rpc.invalidRequest({
// //                         message:
// //                             newDevice.type === DEVICE_TYPE.LEDGER
// //                                 ? "device_already_exists"
// //                                 : "wallet_already_exists",
// //                     })
// //                 }

// //                 storage.devices.push(newDevice)
// //             }

// //             await dispatch(update(deviceUpdate))
// //         } catch (e) {
// //             error(e)
// //             throw veWorldErrors.rpc.internal({
// //                 error: e,
// //                 message: "Failed to add device",
// //             })
// //         }
// //     }

// // /**
// //  * Remove the device for the given rootAddress
// //  * @param rootAddress - The root address for the device
// //  */
// // const remove =
// //     (rootAddress: string): AppThunk<Promise<void>> =>
// //     async dispatch => {
// //         try {
// //             debug("Removing a device")

// //             const deviceUpdate = (storage: DeviceStorageData) => {
// //                 // Get the devices. Cannot delete if it is the only device
// //                 if (storage.devices.length < 2)
// //                     throw Error(
// //                         "Cannot delete the last device. You must wipe the wallet in this scenario",
// //                     )

// //                 // Get the index of the device in the state
// //                 const indexOfExisting = storage.devices.findIndex(d =>
// //                     AddressUtils.compareAddresses(d.rootAddress, rootAddress),
// //                 )

// //                 if (indexOfExisting < 0) {
// //                     // No update required
// //                     return
// //                 }

// //                 // Remove and store
// //                 storage.devices.splice(indexOfExisting, 1)
// //             }

// //             await dispatch(update(deviceUpdate))

// //             // Remove the accounts associated with this device
// //             await dispatch(AccountService.removeAllForDevice(rootAddress))
// //         } catch (e) {
// //             error(e)
// //             throw veWorldErrors.rpc.internal({
// //                 error: e,
// //                 message: "Failed to remove account",
// //             })
// //         }
// //     }

// // /**
// //  * Rename the given device
// //  * @param rootAddress - The address of the device to rename
// //  * @param alias - The new alias for the device
// //  */
// // const rename =
// //     (rootAddress: string, alias: string): AppThunk<Promise<void>> =>
// //     async dispatch => {
// //         try {
// //             debug("Renaming device")

// //             const deviceUpdate = (storage: DeviceStorageData) => {
// //                 // Get the index of the account in the state
// //                 const indexOfExisting = storage.devices.findIndex(d =>
// //                     AddressUtils.compareAddresses(d.rootAddress, rootAddress),
// //                 )

// //                 if (indexOfExisting < 0)
// //                     throw Error(`Failed to find device ${rootAddress}`)

// //                 // Rename and store
// //                 storage.devices[indexOfExisting].alias = alias.trim()
// //             }

// //             await dispatch(update(deviceUpdate))
// //         } catch (e) {
// //             error(e)
// //             throw veWorldErrors.rpc.internal({
// //                 error: e,
// //                 message: "Failed to rename device",
// //             })
// //         }
// //     }

// // const lock = () => DeviceStore.lock()

// // const unlock = (key: string) => DeviceStore.unlock(key)

// const backupDevice =
//     (device: Device): AppThunk<void> =>
//     async () => {
//         try {
//             let devices = await AsyncStore.getFor<Device[]>(
//                 AsyncStoreType.Devices,
//             )

//             if (devices) {
//                 devices.push(device)
//                 await AsyncStore.set<Device[]>(devices, AsyncStoreType.Devices)
//                 await updateDeviceIndex()
//                 return
//             }

//             await AsyncStore.set<Device[]>([device], AsyncStoreType.Devices)
//             await updateDeviceIndex()
//             // set device to redux
//         } catch (e) {
//             error(e)
//         }
//     }

// const updateDeviceIndex = async () => {
//     let lastIndex = await AsyncStore.getFor<string>(AsyncStoreType.DeviceIndex)
//     if (lastIndex) {
//         let newIndex = parseInt(lastIndex, 10)
//         await AsyncStore.set<string>(
//             JSON.stringify(newIndex + 1),
//             AsyncStoreType.DeviceIndex,
//         )
//         return
//     }
//     await AsyncStore.set<string>("1", AsyncStoreType.DeviceIndex)
// }

// export const setDevicesToCache = (): AppThunk<void> => async (dispatch, _) => {
//     let devices = await AsyncStore.getFor<Device[]>(AsyncStoreType.Devices)
//     if (devices) {
//         dispatch(setDevices(devices))
//     }
// }

// export default {
//     backupDevice,
//     // get,
//     // remove,
//     // update,
//     // rename,
//     // reset,
//     // initialiseCache,
//     // add,
//     // unlock,
//     // lock,
// }
