import { CommonActions, useFocusEffect, useNavigation } from "@react-navigation/native"
import { useCallback, useRef } from "react"
import { Routes } from "~Navigation"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const useResetNFTStack = () => {
    const navigation = useNavigation()
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const previousSelectedAccountAddress = useRef(selectedAccount?.address)

    useFocusEffect(
        useCallback(() => {
            if (selectedAccount.address !== previousSelectedAccountAddress.current) {
                navigation.dispatch(state => {
                    const index = state.routes.findIndex(r => r.name === Routes.NFTS)
                    const routes = state.routes.slice(0, index + 1)

                    return CommonActions.reset({
                        ...state,
                        routes,
                        index: routes.length - 1,
                    })
                })
            }
        }, [navigation, selectedAccount.address]),
    )
}
