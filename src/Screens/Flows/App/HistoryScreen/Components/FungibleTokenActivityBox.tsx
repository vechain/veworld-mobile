import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import {
    ColorThemeType,
    DIRECTIONS,
    DateUtils,
    FormattingUtils,
    useTheme,
    useThemedStyles,
} from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { FungibleToken, FungibleTokenActivity, VeChainToken } from "~Model"
import {
    selectCurrency,
    selectCustomTokens,
    selectFungibleTokens,
    useAppSelector,
} from "~Storage/Redux"
import { getCurrencyExchangeRate } from "~Storage/Redux/Selectors/Currency"
import { RootState } from "~Storage/Redux/Types"
import { useI18nContext } from "~i18n"
import * as RNLocalize from "react-native-localize"

type Props = {
    activity: FungibleTokenActivity
    onPress: () => void
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

        const token = useMemo(
            () =>
                allTokens.find(
                    (_token: FungibleToken) =>
                        _token.address === activity.tokenAddress,
                ),
            [activity.tokenAddress, allTokens],
        )

        // exchangeRate is defined if the token is a {VeChainToken}
        const exchangeRate = useAppSelector((state: RootState) =>
            getCurrencyExchangeRate(state, token?.symbol as VeChainToken),
        )

        const currency = useAppSelector(selectCurrency)

        const transferDirectionText =
            activity.direction === DIRECTIONS.UP
                ? LL.BTN_SEND()
                : LL.RECEIVE_ACTIVITY()

        const directionIcon =
            activity.direction === DIRECTIONS.UP ? "arrow-up" : "arrow-down"

        return (
            <BaseView
                w={100}
                flexDirection="row"
                style={styles.container}
                justifyContent="space-between">
                <BaseView flexDirection="row">
                    <DropShadow style={[theme.shadows.card]}>
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
                    </DropShadow>
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView pl={12}>
                            <BaseText typographyFont="buttonPrimary" pb={5}>
                                {transferDirectionText}
                            </BaseText>
                            <BaseText typographyFont="smallCaptionRegular">
                                {activity.timestamp
                                    ? DateUtils.formatDateTime(
                                          activity.timestamp,
                                          locale,
                                          RNLocalize.getTimeZone(),
                                      )
                                    : LL.DATE_NOT_AVAILABLE()}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                </BaseView>
                <BaseView flexDirection="row">
                    {token && (
                        <>
                            <BaseView
                                flexDirection="column"
                                alignItems="center">
                                <BaseView alignItems="flex-end">
                                    <BaseView flexDirection="row" pb={5}>
                                        <BaseText typographyFont="subTitleBold">
                                            {FormattingUtils.humanNumber(
                                                FormattingUtils.scaleNumberDown(
                                                    activity.amount,
                                                    token.decimals,
                                                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                                                ),
                                                activity.amount,
                                            )}{" "}
                                        </BaseText>
                                        <BaseView
                                            flexDirection="row"
                                            alignItems="flex-end"
                                            h={100}>
                                            <BaseText typographyFont="captionRegular">
                                                {token.symbol.toUpperCase()}
                                            </BaseText>
                                        </BaseView>
                                    </BaseView>
                                    <BaseText
                                        typographyFont="smallCaptionMedium"
                                        color={theme.colors.success}>
                                        {FormattingUtils.humanNumber(
                                            FormattingUtils.convertToFiatBalance(
                                                activity.amount as string,
                                                exchangeRate?.rate || 0,
                                                token.decimals || 0,
                                            ),
                                            activity.amount,
                                        )}{" "}
                                        {currency}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                            <BaseView
                                flexDirection="column"
                                alignItems="center">
                                <BaseIcon
                                    size={24}
                                    name="chevron-right"
                                    color={theme.colors.text}
                                    action={onPress}
                                />
                            </BaseView>
                        </>
                    )}
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            borderBottomColor: theme.colors.separator,
            borderBottomWidth: 0.5,
            height: 65,
        },
    })
