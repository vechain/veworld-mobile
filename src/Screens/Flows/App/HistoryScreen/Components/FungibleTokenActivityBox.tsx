import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { useFungibleTokenInfo, useTheme, useThemedStyles } from "~Hooks"
import { DateUtils, FormattingUtils } from "~Utils"
import { COLORS, ColorThemeType, DIRECTIONS } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import {
    Activity,
    ActivityStatus,
    FungibleToken,
    FungibleTokenActivity,
} from "~Model"
import {
    selectCurrency,
    selectCustomTokens,
    selectFungibleTokens,
    useAppSelector,
} from "~Storage/Redux"
import { selectCurrencyExchangeRate } from "~Storage/Redux/Selectors/Currency"
import { RootState } from "~Storage/Redux/Types"
import { useI18nContext } from "~i18n"
import { getCalendars } from "expo-localization"
import { ActivityStatusIndicator } from "."

type Props = {
    activity: FungibleTokenActivity
    onPress: (activity: Activity, token?: FungibleToken) => void
}

export const FungibleTokenActivityBox: React.FC<Props> = memo(
    ({ activity, onPress }) => {
        const theme = useTheme()

        const { styles } = useThemedStyles(baseStyles)

        const { LL, locale } = useI18nContext()

        const allTokens = [
            useAppSelector(selectCustomTokens),
            useAppSelector(selectFungibleTokens),
        ].flat()

        const { symbol, decimals } = useFungibleTokenInfo(activity.tokenAddress)

        const token = useMemo(
            () =>
                allTokens.find(
                    (_token: FungibleToken) =>
                        _token.address === activity.tokenAddress,
                ),
            [activity.tokenAddress, allTokens],
        )

        const exchangeRate = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, token?.symbol ?? symbol ?? ""),
        )

        const currency = useAppSelector(selectCurrency)

        const amountTransferred = useMemo(() => {
            const humanReadable = FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    activity.amount,
                    token?.decimals ?? decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                activity.amount,
            )

            return humanReadable.length > 11
                ? humanReadable.substring(0, 10).concat("...")
                : humanReadable
        }, [activity.amount, decimals, token])

        const fiatValueTransferred = useMemo(() => {
            if (!token || !exchangeRate?.rate) return undefined

            return FormattingUtils.humanNumber(
                FormattingUtils.convertToFiatBalance(
                    activity.amount as string,
                    exchangeRate.rate,
                    token.decimals,
                ),
                activity.amount,
            )
        }, [activity.amount, exchangeRate, token])

        const dateTimeTransfer = useMemo(() => {
            return activity.timestamp
                ? DateUtils.formatDateTime(
                      activity.timestamp,
                      locale,
                      getCalendars()[0].timeZone ?? DateUtils.DEFAULT_TIMEZONE,
                  )
                : LL.DATE_NOT_AVAILABLE()
        }, [LL, activity.timestamp, locale])

        const transferDirectionText =
            activity.direction === DIRECTIONS.UP
                ? LL.BTN_SEND()
                : LL.RECEIVE_ACTIVITY()

        const directionIcon =
            activity.direction === DIRECTIONS.UP ? "arrow-up" : "arrow-down"

        const renderTransferSummary = useMemo(() => {
            if (!amountTransferred) return undefined
            if (!token?.symbol && !symbol) return undefined

            const tokenSymbol = token?.symbol ?? symbol

            return (
                <>
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView alignItems="flex-end">
                            <BaseView flexDirection="row" pb={5}>
                                <BaseText typographyFont="subTitleBold">
                                    {amountTransferred}{" "}
                                </BaseText>
                                <BaseView
                                    flexDirection="row"
                                    alignItems="flex-end"
                                    h={100}>
                                    <BaseText typographyFont="captionRegular">
                                        {tokenSymbol?.toUpperCase()}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                            {fiatValueTransferred && (
                                <BaseText
                                    typographyFont="smallCaptionMedium"
                                    color={theme.colors.success}>
                                    {fiatValueTransferred} {currency}
                                </BaseText>
                            )}
                        </BaseView>
                    </BaseView>
                </>
            )
        }, [
            amountTransferred,
            currency,
            fiatValueTransferred,
            symbol,
            theme.colors.success,
            token?.symbol,
        ])

        return (
            <BaseTouchable
                haptics="Light"
                action={() => onPress(activity, token)}
                style={styles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={styles.innerContainer}
                    justifyContent="space-between">
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
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start">
                                    <BaseText
                                        typographyFont="buttonPrimary"
                                        pb={5}>
                                        {transferDirectionText}
                                    </BaseText>
                                    {activity.status !==
                                        ActivityStatus.SUCCESS && (
                                        <ActivityStatusIndicator
                                            activityStatus={activity.status}
                                        />
                                    )}
                                </BaseView>
                                <BaseText typographyFont="smallCaptionRegular">
                                    {dateTimeTransfer}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseView flexDirection="row">
                        {renderTransferSummary}
                        <BaseView
                            flexDirection="column"
                            alignItems="center"
                            pl={5}>
                            <BaseIcon
                                size={24}
                                name="chevron-right"
                                color={theme.colors.text}
                            />
                        </BaseView>
                    </BaseView>
                </BaseView>
            </BaseTouchable>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        innerContainer: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
            height: 65,
        },
        container: {
            width: "100%",
        },
    })
