import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useFungibleTokenInfo, useTheme } from "~Hooks"
import { BigNutils, DateUtils } from "~Utils"
import { COLORS, DIRECTIONS, getCoinGeckoIdBySymbol } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { Activity, ActivityStatus, FungibleToken, FungibleTokenActivity } from "~Model"
import { selectCurrency, selectCustomTokens, selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { getTimeZone } from "react-native-localize"
import { ActivityStatusIndicator } from "./ActivityStatusIndicator"
import { useExchangeRate } from "~Api/Coingecko"
import FiatBalance from "../../HomeScreen/Components/AccountCard/FiatBalance"

type Props = {
    activity: FungibleTokenActivity
    onPress: (activity: Activity, token?: FungibleToken) => void
}

export const FungibleTokenActivityBox: React.FC<Props> = memo(({ activity, onPress }) => {
    const theme = useTheme()

    const { LL, locale } = useI18nContext()

    const allTokens = [useAppSelector(selectCustomTokens), useAppSelector(selectOfficialTokens)].flat()

    const { symbol, decimals } = useFungibleTokenInfo(activity.tokenAddress)

    const token = useMemo(
        () => allTokens.find((_token: FungibleToken) => _token.address === activity.tokenAddress),
        [activity.tokenAddress, allTokens],
    )

    const currency = useAppSelector(selectCurrency)

    // TODO: handle loading state
    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[symbol ?? token?.symbol ?? ""],
        vs_currency: currency,
    })

    const amountTransferred = useMemo(() => {
        return BigNutils(activity.amount)
            .toHuman(token?.decimals ?? decimals ?? 0)
            .toTokenFormat_string(2)
    }, [activity.amount, decimals, token])

    const fiatValueTransferred = useMemo(() => {
        if (!token || !exchangeRate) return undefined
        const amount = BigNutils(activity.amount).toHuman(token.decimals).toString
        const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(amount, exchangeRate)
        return isLeesThan_0_01 ? `< ${value}` : value
    }, [activity.amount, exchangeRate, token])

    const dateTimeTransfer = useMemo(() => {
        return activity.timestamp
            ? DateUtils.formatDateTime(activity.timestamp, locale, getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE)
            : LL.DATE_NOT_AVAILABLE()
    }, [LL, activity.timestamp, locale])

    const transferDirectionText = activity.direction === DIRECTIONS.UP ? LL.BTN_SEND() : LL.RECEIVE_ACTIVITY()

    const directionIcon = activity.direction === DIRECTIONS.UP ? "icon-arrow-up" : "icon-arrow-down"

    const renderTransferSummary = useMemo(() => {
        if (!amountTransferred) return undefined
        if (!token?.symbol && !symbol) return undefined

        const tokenSymbol = token?.symbol ?? symbol

        return (
            <BaseView flexDirection="column" alignItems="center">
                <BaseView alignItems="flex-end">
                    <BaseView flexDirection="row" pb={5}>
                        <BaseText typographyFont="subTitleBold">{amountTransferred} </BaseText>
                        <BaseView flexDirection="row" alignItems="flex-end" h={100}>
                            <BaseText typographyFont="captionRegular">{tokenSymbol?.toUpperCase()}</BaseText>
                        </BaseView>
                    </BaseView>
                    {fiatValueTransferred && (
                        <FiatBalance
                            typographyFont="smallCaptionMedium"
                            balances={[fiatValueTransferred]}
                            color={theme.colors.success}
                        />
                    )}
                </BaseView>
            </BaseView>
        )
    }, [amountTransferred, fiatValueTransferred, symbol, theme.colors.success, token?.symbol])

    return (
        <BaseTouchable haptics="Light" action={() => onPress(activity, token)} style={baseStyles.container}>
            <BaseView w={100} flexDirection="row" style={baseStyles.innerContainer} justifyContent="space-between">
                <BaseView flexDirection="row">
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseIcon
                            name={directionIcon}
                            size={20}
                            color={COLORS.DARK_PURPLE}
                            testID="magnify"
                            bg={COLORS.WHITE}
                            iconPadding={4}
                        />
                    </BaseView>
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView pl={12}>
                            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start">
                                <BaseText typographyFont="buttonPrimary" pb={5}>
                                    {transferDirectionText}
                                </BaseText>
                                {activity.status && activity.status !== ActivityStatus.SUCCESS && (
                                    <ActivityStatusIndicator activityStatus={activity.status} />
                                )}
                            </BaseView>
                            <BaseText typographyFont="smallCaptionRegular">{dateTimeTransfer}</BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseView flexDirection="row">
                    {renderTransferSummary}
                    <BaseView flexDirection="column" alignItems="center" pl={5}>
                        <BaseIcon size={24} name="icon-chevron-right" color={theme.colors.text} />
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseTouchable>
    )
})

const baseStyles = StyleSheet.create({
    innerContainer: {
        height: 68,
    },
    container: {
        width: "100%",
    },
})
