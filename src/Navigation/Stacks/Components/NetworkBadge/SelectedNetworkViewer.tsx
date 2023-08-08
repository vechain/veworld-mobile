import { useTheme } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Network } from "~Model"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const SelectedNetworkViewer = () => {
    const network: Network = useAppSelector(selectSelectedNetwork)
    const theme = useTheme()
    const { styles } = useThemedStyles(selectedNetworkViewerStyle)

    return (
        <BaseView style={styles.networkRow}>
            <BaseView style={styles.networkViewer}>
                <BaseView style={styles.networkViewerIconText}>
                    <BaseIcon
                        name={"web"}
                        color={theme.colors.text}
                        size={12}
                        testID={"web"}
                        style={styles.networkViewerNetworkIcon}
                    />
                    <BaseText style={styles.networkViewerNetworkNameText}>
                        {network.type}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseView>
    )
}

const selectedNetworkViewerStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        networkRow: {
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
        },
        networkViewer: {
            height: 25,
            width: 120,
            borderRadius: 10,
            backgroundColor: theme.colors.card,
            justifyContent: "center",
        },
        networkViewerIconText: {
            flexDirection: "row",
            justifyContent: "center",
        },
        networkViewerNetworkNameText: {
            paddingLeft: 5,
        },
        networkViewerNetworkIcon: {
            paddingTop: 2,
        },
    })
