import { CommonActions, useNavigation } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useResetSettingStack = () => {
    const navigation = useNavigation()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const previousSelectedAccountAddress = useRef(selectedAccount?.address)
    const previousSelectedNetwork = useRef(selectedNetwork)

    const hasAccountChanged = !AddressUtils.compareAddresses(
        selectedAccount.address,
        previousSelectedAccountAddress.current,
    )

    const hasNetworkChanged = selectedNetwork.id !== previousSelectedNetwork.current.id

    useEffect(() => {
        if (hasAccountChanged || hasNetworkChanged) {
            previousSelectedAccountAddress.current = selectedAccount.address
            previousSelectedNetwork.current = selectedNetwork

            navigation.dispatch(state => {
                const routes = [{ name: Routes.SETTINGS }]

                return CommonActions.reset({
                    ...state,
                    routes,
                    index: 0,
                })
            })
        }
    }, [hasAccountChanged, hasNetworkChanged, navigation, selectedAccount.address, selectedNetwork])
}
