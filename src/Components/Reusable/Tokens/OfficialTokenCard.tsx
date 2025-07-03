import { StyleSheet, TouchableOpacity, ViewProps } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenImage } from "../TokenImage"
import { FungibleToken } from "~Model"
import { isVechainToken } from "~Utils/TokenUtils/TokenUtils"

type OfficialTokenCardProps = {
    token: FungibleToken
    tokenWithInfo?: Partial<TokenWithCompleteInfo>
    action: () => void
    selected?: boolean
    iconSize?: number
}

export const OfficialTokenCard = memo(
    ({ token, tokenWithInfo = {}, style, action, selected, iconSize }: OfficialTokenCardProps & ViewProps) => {
        const { styles } = useThemedStyles(baseStyles(selected))
        const isVetToken = isVechainToken(token.symbol)

        const symbol = useMemo(() => tokenWithInfo.symbol ?? token?.symbol, [tokenWithInfo.symbol, token?.symbol])

        const isCrossChainToken = useMemo(() => {
            return !!token.crossChainProvider
        }, [token.crossChainProvider])

        return (
            <TouchableOpacity onPress={action} style={[styles.container, style]} testID={symbol}>
                <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                    <BaseView flexDirection="row" justifyContent="flex-start">
                        <TokenImage
                            icon={tokenWithInfo?.icon ?? token.icon}
                            symbol={token.symbol}
                            isVechainToken={isVetToken}
                            iconSize={iconSize ?? 26}
                            isCrossChainToken={isCrossChainToken}
                        />
                        <BaseSpacer width={12} />
                        <BaseView flexDirection="row">
                            <BaseText typographyFont="bodyBold" ellipsizeMode="tail" numberOfLines={1}>
                                {token.symbol}
                            </BaseText>
                            <BaseSpacer width={8} />
                        </BaseView>
                    </BaseView>
                </BaseView>
            </TouchableOpacity>
        )
    },
)

const baseStyles = (selected?: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            height: 72,
            justifyContent: "center",
            marginBottom: 8,
            paddingHorizontal: 16,
            borderWidth: selected ? 1 : 0,
            borderRadius: 12,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.text,
        },
        balanceInfo: {
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 2,
        },
    })
