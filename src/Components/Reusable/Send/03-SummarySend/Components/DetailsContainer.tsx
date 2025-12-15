import React, { PropsWithChildren, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { CURRENCY, COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE, FungibleToken } from "~Model"
import { AddressUtils, TokenUtils } from "~Utils"
import CurrencyConfig from "~Constants/Constants/CurrencyConfig/CurrencyConfig"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AccountIcon } from "~Components/Reusable/Account/AccountIcon"

const PADDING = 16
const GAP_RIGHT = 12

const DetailsContainer = ({ children }: PropsWithChildren) => {
    const { styles } = useThemedStyles(valueContainerStyles)
    return (
        <BaseView style={styles.root} borderRadius={16}>
            {children}
        </BaseView>
    )
}

const TokenValue = ({ value, token }: { value: string; token: FungibleToken }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            py={PADDING}
            px={PADDING}
            testID={`SEND_SUMMARY_TOKEN_VALUE_${token.symbol}`}>
            <BaseText
                typographyFont="bodySemiBold"
                color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                testID={"SEND_SUMMARY_TOKEN_VALUE_VALUE"}>
                {LL.TOKEN()}
            </BaseText>
            <BaseView flexDirection="row" gap={GAP_RIGHT}>
                <BaseView flexDirection="row" gap={2}>
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}
                        testID={"SEND_SUMMARY_TOKEN_VALUE_VALUE"}>
                        {value}
                    </BaseText>
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}
                        testID={"SEND_SUMMARY_TOKEN_VALUE_SYMBOL"}>
                        {token.symbol}
                    </BaseText>
                </BaseView>
                <TokenImage
                    icon={token.icon}
                    iconSize={24}
                    isCrossChainToken={!!token.crossChainProvider}
                    isVechainToken={TokenUtils.isVechainToken(token.symbol)}
                    rounded
                    symbol={token.symbol}
                />
            </BaseView>
        </BaseView>
    )
}

const FiatValue = ({ value, testID }: { value: string; testID?: string }) => {
    const { styles, theme } = useThemedStyles(fiatValueStyles)
    const { LL } = useI18nContext()

    const selectedCurrency = useAppSelector(selectCurrency)
    const currencyIcon = useMemo(() => {
        const config = CurrencyConfig.find(c => c.currency === selectedCurrency) ?? CurrencyConfig[0]

        if (!config.iconName && selectedCurrency === CURRENCY.USD) return "icon-dollar-sign"
        if (!config.iconName && selectedCurrency === CURRENCY.EUR) return "icon-euro"

        return config.iconName
    }, [selectedCurrency])

    return (
        <BaseView
            flexDirection="row"
            justifyContent="space-between"
            py={PADDING}
            px={PADDING}
            testID={testID}
            style={styles.root}>
            <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {LL.VALUE_TITLE()}
            </BaseText>
            <BaseView flexDirection="row" gap={GAP_RIGHT}>
                <BaseText
                    typographyFont="subSubTitleSemiBold"
                    color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}
                    testID={`${testID}_VALUE`}>
                    {value}
                </BaseText>
                <BaseIcon
                    borderRadius={99}
                    bg={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100}
                    name={currencyIcon}
                    size={16}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_600}
                />
            </BaseView>
        </BaseView>
    )
}

const TokenReceiver = ({ address, testID }: { address: string; testID?: string }) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const vns = useVns({
        name: "",
        address: address,
    })

    const displayAddress = useMemo(() => {
        return AddressUtils.showAddressOrName(address, vns, { ellipsed: true })
    }, [address, vns])

    return (
        <BaseView flexDirection="row" justifyContent="space-between" py={PADDING} px={PADDING} testID={testID}>
            <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {LL.ADDITIONAL_DETAIL_RECEIVER()}
            </BaseText>

            <BaseView flexDirection="row" gap={GAP_RIGHT}>
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                    {displayAddress}
                </BaseText>
                <AccountIcon account={{ address, type: DEVICE_TYPE.LOCAL_MNEMONIC }} size={24} />
            </BaseView>
        </BaseView>
    )
}
DetailsContainer.FiatValue = FiatValue
DetailsContainer.TokenValue = TokenValue
DetailsContainer.TokenReceiver = TokenReceiver

export { DetailsContainer }

const valueContainerStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_50,
        },
    })

const fiatValueStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.isDark ? "#1D173A" : COLORS.GREY_100,
        },
    })
