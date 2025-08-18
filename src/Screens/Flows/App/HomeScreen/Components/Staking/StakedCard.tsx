import { useNavigation } from "@react-navigation/native"
import { memo, default as React } from "react"
import { StyleSheet } from "react-native"
import { BaseTouchable } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import { VET } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { Routes } from "~Navigation"
import { NftData, NodeInfo } from "~Model/Staking"

interface StakedCardProps {
    nodes: NodeInfo[]
    nfts: NftData[]
    isOwner: boolean
    isLoading: boolean
}

export const StakedCard = memo<StakedCardProps>(({ nodes, nfts, isOwner, isLoading }) => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const vetWithCompleteInfo = useTokenWithCompleteInfo(VET)

    if (!isLoading && nodes.length === 0) return null

    return (
        <BaseTouchable
            style={styles.container}
            onPress={() => nav.navigate(Routes.TOKEN_DETAILS, { token: vetWithCompleteInfo })}>
            <StargateLockedValue isLoading={isLoading} nfts={nfts} isNodeOwner={isOwner} />
        </BaseTouchable>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.card,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            gap: 16,
        },
        valueContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        vetContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
    })
