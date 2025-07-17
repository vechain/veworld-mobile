import { memo, default as React } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import { ColorThemeType } from "~Constants/Theme"
import { useThemedStyles } from "~Hooks"
import { useUserNodes } from "~Hooks/Staking/useUserNodes"
import { useUserStargateNfts } from "~Hooks/Staking/useUserStargateNfts"
import { useI18nContext } from "~i18n"
import { selectSelectedAccountAddress, useAppSelector } from "~Storage/Redux"

export const StakedCard = memo(() => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const address = useAppSelector(selectSelectedAccountAddress)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes)

    if (!isLoadingNfts && !isLoadingNodes && stargateNodes.length === 0) return null

    return (
        <BaseView mb={40}>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseSpacer height={8} />
            <StargateLockedValue
                rootStyle={styles.container}
                isLoading={isLoadingNfts || isLoadingNodes}
                nfts={ownedStargateNfts}
            />
        </BaseView>
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
