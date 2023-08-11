import { useTheme } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBlockchainNetwork } from "~Hooks/useBlockchainNetwork"
import {
    capitalize,
    truncateTextIfSizeIsGreaterThan,
} from "~Utils/StringUtils/StringUtils"

type Props = {
    showEvenIfMainnet?: boolean
}

export const SelectedNetworkViewer = ({ showEvenIfMainnet = false }: Props) => {
    const { network, isMainnet } = useBlockchainNetwork()
    const theme = useTheme()
    const { styles } = useThemedStyles(selectedNetworkViewerStyle)

    return showEvenIfMainnet || !isMainnet ? (
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
                    {network.name.length > 0 && formatNetworkName(network.name)}
                </BaseText>
            </BaseView>
        </BaseView>
    ) : null
}

const formatNetworkName = (networkName: string) => {
    return capitalize(truncateTextIfSizeIsGreaterThan(8, networkName))
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
            paddingLeft: 10,
            paddingRight: 10,
        },
        networkViewerNetworkNameText: {
            paddingLeft: 5,
        },
        networkViewerNetworkIcon: {
            paddingTop: 1,
        },
    })
