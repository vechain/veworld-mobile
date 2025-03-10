import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useBlockchainNetwork } from "~Hooks"

import { capitalize, truncateTextIfSizeIsGreaterThan } from "~Utils/StringUtils/StringUtils"
import { useNavigation } from "@react-navigation/native"
import HapticsService from "~Services/HapticsService"
import { Routes } from "~Navigation"

type Props = {
    showEvenIfMainnet?: boolean
}

export const SelectedNetworkViewer = ({ showEvenIfMainnet = false }: Props) => {
    const { network, isMainnet } = useBlockchainNetwork()
    const nav = useNavigation()
    const { styles, theme } = useThemedStyles(selectedNetworkViewerStyle(isMainnet))

    const onNetworkLabelPress = useCallback(() => {
        HapticsService.triggerImpact({ level: "Light" })
        nav.navigate(Routes.SETTINGS_NETWORK)
    }, [nav])

    return showEvenIfMainnet || !isMainnet ? (
        <TouchableOpacity style={styles.networkViewer} onPress={onNetworkLabelPress}>
            <BaseView style={styles.networkViewerIconText}>
                <BaseIcon name="icon-globe" color={theme.colors.testnetText} size={16} testID="web" />
                <BaseText pl={5} typographyFont="smallCaptionSemiBold" color={theme.colors.testnetText}>
                    {network.name.length > 0 && formatNetworkName(network.name).toLowerCase()}
                </BaseText>
            </BaseView>
        </TouchableOpacity>
    ) : null
}

const formatNetworkName = (networkName: string) => {
    return capitalize(truncateTextIfSizeIsGreaterThan(8, networkName))
}

const selectedNetworkViewerStyle = (isMainnet: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        networkViewer: {
            borderRadius: 6,
            padding: 8,
            backgroundColor: isMainnet ? theme.colors.card : theme.colors.testnetBackground,
            justifyContent: "center",
            flexShrink: 1,
        },
        networkViewerIconText: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center",
        },
    })
