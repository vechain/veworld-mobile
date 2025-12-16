import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { NativeSyntheticEvent } from "react-native"
import ContextMenu, { ContextMenuAction, ContextMenuOnPressNativeEvent } from "react-native-context-menu-view"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { switchActiveNetwork } from "~Storage/Redux/Actions"
import { useAppDispatch, useAppSelector } from "~Storage/Redux/Hooks"
import { selectNetworks, selectSelectedNetwork } from "~Storage/Redux/Selectors"
import { clearNFTCache } from "~Storage/Redux/Slices/Nft"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

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
            selected: net.id === currentNetwork.id,
            systemIcon: "globe",
        }))
        return [
            ...networkOptions,
            {
                title: LL.NETWORK_ADD_CUSTOM_NODE(),
                selected: false,
                systemIcon: "plus",
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
            dispatch(switchActiveNetwork(networks[e.nativeEvent.index]))
        },
        [dispatch, networks, nav],
    )

    return (
        <ContextMenu
            previewBackgroundColor="transparent"
            actions={renderNetworkOptions}
            onPress={onContextMenuPress}
            disabled={isAndroid()}>
            {children}
        </ContextMenu>
    )
}
