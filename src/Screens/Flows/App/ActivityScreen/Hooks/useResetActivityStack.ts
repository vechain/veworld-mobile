import { CommonActions, useNavigation } from "@react-navigation/native"
import { useEffect, useMemo, useRef } from "react"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"

export const useResetActivityStack = () => {
    const navigation = useNavigation()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const previousSelectedAccountAddress = useRef(selectedAccount?.address)
    const previousSelectedNetwork = useRef(selectedNetwork)

    const hasAccountChanged = useMemo(
        () => !AddressUtils.compareAddresses(selectedAccount.address, previousSelectedAccountAddress.current),
        [selectedAccount.address],
    )

    const hasNetworkChanged = useMemo(
        () => selectedNetwork.id !== previousSelectedNetwork.current.id,
        [selectedNetwork.id],
    )

    useEffect(() => {
        if (hasAccountChanged || hasNetworkChanged) {
            previousSelectedAccountAddress.current = selectedAccount.address
            previousSelectedNetwork.current = selectedNetwork

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
    }, [hasAccountChanged, hasNetworkChanged, navigation, selectedAccount.address, selectedNetwork])
}
