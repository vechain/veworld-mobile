import { Object, Results } from "realm"
import { Device } from "~Storage"

/**
 *
 * @param devices
 * @returns
 */

type RealmDevice = Results<Device & Object<unknown, never>>

export const getDeviceIndex = (devices: RealmDevice) => {
    let lastIndex = devices.length
    if (lastIndex) {
        let newIndex = lastIndex + 1
        return newIndex
    }
    return 1
}
