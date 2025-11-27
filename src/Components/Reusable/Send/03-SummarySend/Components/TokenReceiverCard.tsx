import React from "react"
import { Animated, StyleSheet } from "react-native"
import { BaseView, BaseText, BaseIcon } from "~Components"
import { ColorThemeType, COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DetailsContainer } from "./DetailsContainer"
import { FungibleTokenWithBalance } from "~Model"
import { useTokenCardBalance } from "~Hooks/useTokenCardBalance"

type TokenReceiverCardProps = {
    token: FungibleTokenWithBalance
    amount: string
    address: string
}

export const TokenReceiverCard = ({ token, amount, address }: TokenReceiverCardProps) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { fiatBalance } = useTokenCardBalance({ token })
    return (
        <Animated.View>
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" pb={16}>
                <BaseView flexDirection="row" justifyContent="flex-start" alignItems="center" gap={12}>
                    <BaseView style={[styles.iconContainer]}>
                        <BaseIcon color={theme.colors.defaultIcon.color} name="icon-list-checks" size={16} />
                    </BaseView>
                    <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                        {LL.SEND_RECEIVER_DETAILS()}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                    {LL.SEND_RECEIVER_DETAILS_COUNT({ current: 3, total: 3 })}
                </BaseText>
            </BaseView>
            <DetailsContainer>
                <DetailsContainer.TokenValue value={amount} token={token} />
                <DetailsContainer.FiatValue value={fiatBalance} />
                <DetailsContainer.TokenReceiver address={address} />
            </DetailsContainer>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            borderColor: theme.colors.defaultIcon.border,
            borderWidth: 1,
            backgroundColor: theme.colors.defaultIcon.background,
            color: theme.colors.defaultIcon.color,
            padding: 8,
            borderRadius: 16,
            width: 32,
            height: 32,
        },
    })
