import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { StargateLockedValue } from "~Components/Reusable/Staking"
import { VET } from "~Constants"
import { AccountWithDevice } from "~Model"
import { ColorThemeType } from "~Constants/Theme"
import { useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useUserNodes } from "~Hooks/Staking/useUserNodes"
import { useUserStargateNfts } from "~Hooks/Staking/useUserStargateNfts"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { AddressUtils } from "~Utils"

type Props = {
    account: AccountWithDevice
}

export const StakedCard = ({ account }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const { stargateNodes, isLoading: isLoadingNodes } = useUserNodes(account.address)
    const { ownedStargateNfts, isLoading: isLoadingNfts } = useUserStargateNfts(stargateNodes, isLoadingNodes)
    // We only include staked VET in fiat balance if user is the owner, not a manager - Stargate staking
    const isNodeOwner = stargateNodes.some(node => AddressUtils.compareAddresses(node.xNodeOwner, account.address))
    const nav = useNavigation()

    const vetWithCompleteInfo = useTokenWithCompleteInfo(VET)

    // Check if user has any active relationship with nodes (owner, delegator, or delegatee)
    const hasActiveNodes = stargateNodes.some(
        node =>
            AddressUtils.compareAddresses(node.xNodeOwner, account.address) || // Is owner
            node.isXNodeDelegator || // Is delegator
            node.isXNodeDelegatee, // Is delegatee
    )

    if (!isLoadingNfts && !isLoadingNodes && (!hasActiveNodes || stargateNodes.length === 0)) return null

    return (
        <BaseView>
            <BaseText py={10} typographyFont="bodySemiBold">
                {LL.ACTIVITY_STAKING_LABEL()}
            </BaseText>
            <BaseSpacer height={8} />
            <BaseTouchable
                style={styles.container}
                onPress={() => nav.navigate(Routes.TOKEN_DETAILS, { token: vetWithCompleteInfo })}>
                <StargateLockedValue
                    isLoading={isLoadingNfts || isLoadingNodes}
                    nfts={ownedStargateNfts}
                    isNodeOwner={isNodeOwner}
                />
            </BaseTouchable>
        </BaseView>
    )
}

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
