import { AddressUtils } from "~Common"
import { Account, Device, useStore } from "~Storage"
import { useCallback } from "react"
import { getAccountAndAliasIndex } from "./Helpers/getAccountAndAliasIndex"
import { getAliasName } from "./Helpers/getAliasName"

export const useCreateAccount = () => {
    const store = useStore()

    const createAccountFor = useCallback(
        (device: Device & Realm.Object<unknown, never>) => {
            if (!device.xPub) {
                return
            }

            const { accountIndex, aliasIndex } = getAccountAndAliasIndex(device)

            const address = AddressUtils.getAddressFromXPub(
                device.xPub,
                accountIndex,
            )

            let account: Account

            store.write(() => {
                account = store.create(Account.getName(), {
                    address: address,
                    index: accountIndex,
                    visible: true,
                    alias: `${getAliasName} ${aliasIndex}`,
                })

                device.accounts?.push(account)
            })
        },
        [store],
    )

    return createAccountFor
}
