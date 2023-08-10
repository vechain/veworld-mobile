import { useTheme } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Network } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import {
    capitalize,
    truncateTextIfSizeIsGreaterThan,
} from "~Utils/StringUtils/StringUtils"

export const SelectedNetworkViewer = () => {
    const network: Network = useAppSelector(selectSelectedNetwork)
    const theme = useTheme()
    const { styles } = useThemedStyles(selectedNetworkViewerStyle)

    return (
        <BaseView style={styles.networkViewer}>
            <BaseView style={styles.networkViewerIconText}>
                <BaseIcon
                    name={"web"}
                    color={theme.colors.text}
                    size={15}
                    testID={"web"}
                    style={styles.networkViewerNetworkIcon}
                />
                <BaseText style={styles.networkViewerNetworkNameText}>
                    {network.name && formatNetworkName(network.name)}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}

const formatNetworkName = (networkName: string) => {
    return capitalize(truncateTextIfSizeIsGreaterThan(10, networkName))
}

const selectedNetworkViewerStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        networkViewer: {
            height: 25,
            borderRadius: 10,
            backgroundColor: theme.colors.card,
            justifyContent: "center",
        },
        networkViewerIconText: {
            flexDirection: "row",
            justifyContent: "center",
            paddingLeft: 15,
            paddingRight: 15,
        },
        networkViewerNetworkNameText: {
            paddingLeft: 5,
        },
        networkViewerNetworkIcon: {
            paddingTop: 1,
        },
    })
