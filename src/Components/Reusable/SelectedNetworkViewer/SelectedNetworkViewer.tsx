import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles, useBlockchainNetwork } from "~Hooks"

import { capitalize, truncateTextIfSizeIsGreaterThan } from "~Utils/StringUtils/StringUtils"

type Props = {
    showEvenIfMainnet?: boolean
}

export const SelectedNetworkViewer = ({ showEvenIfMainnet = false }: Props) => {
    const { network, isMainnet } = useBlockchainNetwork()
    const { styles, theme } = useThemedStyles(selectedNetworkViewerStyle(isMainnet))

    return showEvenIfMainnet || !isMainnet ? (
        <BaseView style={styles.networkViewer}>
            <BaseView style={styles.networkViewerIconText}>
                <BaseIcon
                    name="icon-globe"
                    color={theme.colors.text}
                    size={15}
                    testID="web"
                    style={styles.networkViewerNetworkIcon}
                />
                <BaseText pl={5}>{network.name.length > 0 && formatNetworkName(network.name)}</BaseText>
            </BaseView>
        </BaseView>
    ) : null
}

const formatNetworkName = (networkName: string) => {
    return capitalize(truncateTextIfSizeIsGreaterThan(8, networkName))
}

const selectedNetworkViewerStyle = (isMainnet: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        networkViewer: {
            height: 25,
            borderRadius: 10,
            backgroundColor: isMainnet ? theme.colors.card : theme.colors.testnetBackground,
            justifyContent: "center",
            marginRight: 12,
        },
        networkViewerIconText: {
            flexDirection: "row",
            justifyContent: "center",
            paddingLeft: 10,
            paddingRight: 10,
        },
        networkViewerNetworkIcon: {
            paddingTop: 1,
        },
    })
