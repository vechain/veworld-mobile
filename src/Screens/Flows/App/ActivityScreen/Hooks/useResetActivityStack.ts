import { CommonActions, useNavigation } from "@react-navigation/native"
import { useEffect, useRef } from "react"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useResetActivityStack = () => {
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
            navigation.dispatch(state => {
                const index = state.routes.findIndex(r => r.name === Routes.HISTORY)
                const routes = state.routes.slice(0, index + 1)

                return CommonActions.reset({
                    ...state,
                    routes,
                    index: routes.length - 1,
                })
            })
        }
    }, [hasAccountChanged, hasNetworkChanged, navigation, selectedAccount.address])
}
