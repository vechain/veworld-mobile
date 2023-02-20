import { Object } from "realm"
import { Device } from "~Storage"

/**
 *
 * @param devices
 * @returns
 */

type RealmDevice = Device & Object<unknown, never>

export const getAccountAndAliasIndex = (device: RealmDevice) => {
    let lastIndex = device.accounts.length
    if (lastIndex) {
        let newIndex = lastIndex + 1
        return {
            accountIndex: device.accounts.length,
            aliasIndex: newIndex,
        }
    }

    return { accountIndex: 0, aliasIndex: 1 }
}
