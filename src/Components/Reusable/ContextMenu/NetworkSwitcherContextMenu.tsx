import ContextMenu, { ContextMenuAction, ContextMenuOnPressNativeEvent } from "react-native-context-menu-view"
import React, { useCallback, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "~Storage/Redux/Hooks"
import { useI18nContext } from "~i18n"
import { selectNetworks, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { NativeSyntheticEvent } from "react-native"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import HapticsService from "~Services/HapticsService"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { clearNFTCache } from "~Storage/Redux/Slices/Nft"

type Props = {
    children: React.ReactNode
}

export const NetworkSwitcherContextMenu = ({ children }: Props) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const networks = useAppSelector(selectNetworks)
    const currentNetwork = useAppSelector(selectSelectedNetwork)
    const nav = useNavigation()

    const renderNetworkOptions: ContextMenuAction[] = useMemo(() => {
        const networkOptions = networks.map(net => ({
            title: net.name,
            subtitle: net.currentUrl,
            selected: net.id === currentNetwork.id,
        }))
        return [
            ...networkOptions,
            {
                title: LL.NETWORK_ADD_CUSTOM_NODE(),
                selected: false,
            },
        ] as ContextMenuAction[]
    }, [LL, networks, currentNetwork.id])

    const onContextMenuPress = useCallback(
        (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
            HapticsService.triggerImpact({ level: "Light" })
            if (e.nativeEvent.index === networks.length) {
                nav.navigate(Routes.SETTINGS_NETWORK)
                return
            }

            dispatch(clearNFTCache())
            dispatch(changeSelectedNetwork(networks[e.nativeEvent.index]))
        },
        [dispatch, networks, nav],
    )

    return (
        <ContextMenu previewBackgroundColor="transparent" actions={renderNetworkOptions} onPress={onContextMenuPress}>
            {children}
        </ContextMenu>
    )
}
