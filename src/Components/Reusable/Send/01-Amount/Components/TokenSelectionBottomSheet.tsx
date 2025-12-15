import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { AlertInline, BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, NON_SENDABLE_TOKENS, VeDelegate, VOT3 } from "~Constants"
import { ColorThemeType, typography } from "~Constants/Theme"
import { useBalances, useCombineFiatBalances, useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"
import { useI18nContext } from "~i18n"

type TokenSelectionBottomSheetProps = {
    selectedToken: FungibleTokenWithBalance
    setSelectedToken: (token: FungibleTokenWithBalance) => void
    onClose: (token: FungibleTokenWithBalance) => void
}

type EnhancedTokenCardProps = {
    item: FungibleTokenWithBalance
    onSelectedToken: (token: FungibleTokenWithBalance) => void
    selected: boolean
    disabled?: boolean
    onDisabledPress?: () => void
}

const EnhancedTokenCard = ({ item, selected, onSelectedToken, disabled, onDisabledPress }: EnhancedTokenCardProps) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseTokenCardStyles({ selected }))
    const currency = useAppSelector(selectCurrency)

    const name = useTokenDisplayName(item)
    const isCrossChainToken = useMemo(() => !!item.crossChainProvider, [item.crossChainProvider])

    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[item.symbol]
        if (coingeckoId) return coingeckoId
        if (item.symbol === VeDelegate.symbol) return getCoinGeckoIdBySymbol[B3TR.symbol]
        return item.symbol
    }, [item.symbol])

    const { data: exchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: exchangeRateId,
    })

    const { fiatBalance } = useBalances({
        token: item,
        exchangeRate: exchangeRate ?? 0,
    })

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(
        () => combineFiatBalances([fiatBalance]),
        [combineFiatBalances, fiatBalance],
    )

    const { formatFiat, formatLocale } = useFormatFiat()
    const renderFiatBalance = useMemo(() => {
        const formattedFiat = formatFiat({ amount, cover: false })
        if (areAlmostZero) return `< ${formattedFiat}`
        return formattedFiat
    }, [formatFiat, amount, areAlmostZero])

    const tokenBalance = useMemo(() => {
        return formatTokenAmount(item.balance?.balance ?? "0", item.symbol, item.decimals ?? 0, {
            locale: formatLocale,
            includeSymbol: false,
        })
    }, [formatLocale, item.balance?.balance, item.decimals, item.symbol])

    const showFiatBalance = useMemo(() => {
        return !!exchangeRate
    }, [exchangeRate])

    const onPress = useCallback(() => {
        if (disabled && onDisabledPress) {
            onDisabledPress()
        } else if (!disabled) {
            onSelectedToken(item)
        }
    }, [disabled, item, onDisabledPress, onSelectedToken])

    return (
        <BaseTouchableBox
            action={onPress}
            testID="TOKEN_SELECTOR_BOTTOM_SHEET_TOKEN"
            py={item.symbol ? typography.lineHeight.body : typography.lineHeight.captionSemiBold}
            flexDirection="row"
            bg={disabled ? theme.colors.sendScreen.tokenAmountCard.disabledTokenCardBackground : theme.colors.card}
            containerStyle={styles.container}
            innerContainerStyle={styles.root}>
            <BaseView flexDirection="row" gap={16} style={styles.leftSection}>
                <TokenImage
                    icon={item.icon}
                    isVechainToken={AddressUtils.isVechainToken(item.address)}
                    iconSize={32}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {item.symbol ? (
                    <BaseView flexDirection="column" flexGrow={0} gap={3} flexShrink={1} style={styles.tokenInfo}>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        <BaseText typographyFont="captionSemiBold" color={theme.colors.activityCard.subtitleLight}>
                            {item.symbol}
                        </BaseText>
                    </BaseView>
                ) : (
                    <BaseText
                        flex={1}
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        flexDirection="row">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <BaseView flexDirection="column" alignItems="flex-end" style={styles.balanceSection}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            align="right"
                            flexDirection="row"
                            testID="TOKEN_CARD_FIAT_BALANCE">
                            {renderFiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            align="right"
                            flexDirection="row"
                            testID="TOKEN_CARD_TOKEN_BALANCE">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        align="right"
                        flexDirection="row"
                        testID="TOKEN_CARD_TOKEN_BALANCE">
                        {tokenBalance}
                    </BaseText>
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

export const TokenSelectionBottomSheet = React.forwardRef<BottomSheetModalMethods, TokenSelectionBottomSheetProps>(
    function TokenSelectionBottomSheet({ selectedToken: _selectedToken, setSelectedToken, onClose }, ref) {
        const { LL } = useI18nContext()
        const { theme, styles } = useThemedStyles(baseBottomSheetStyles)
        const [vot3WarningVisible, setVot3WarningVisible] = useState(false)

        const availableTokens = useSendableTokensWithBalance({ includeVOT3: true })

        const filteredTokens = useMemo(() => {
            const vot3Token = availableTokens.find(token => token.symbol === VOT3.symbol)
            if (vot3Token) {
                return [...availableTokens.filter(token => !NON_SENDABLE_TOKENS.includes(token.symbol)), vot3Token]
            }
            return availableTokens.filter(token => !NON_SENDABLE_TOKENS.includes(token.symbol))
        }, [availableTokens])

        const handleTokenSelect = useCallback(
            (token: FungibleTokenWithBalance) => {
                setSelectedToken(token)
                onClose(token)
                setVot3WarningVisible(false)
            },
            [onClose, setSelectedToken],
        )

        const handleVot3Press = useCallback(() => {
            setVot3WarningVisible(true)
        }, [])

        const onDismiss = useCallback(() => {
            //Reset vot3 warning to hidden when the bottom sheet is dismissed
            setVot3WarningVisible(false)
        }, [])

        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                contentStyle={styles.rootContent}
                backgroundStyle={styles.rootContentBackground}
                onDismiss={onDismiss}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-coins" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SEND_TOKEN_TITLE()}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body" color={theme.colors.editSpeedBs.subtitle}>
                    {LL.SEND_TOKEN_SELECT()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseView flexDirection="column" gap={8}>
                    {filteredTokens.map(tk => {
                        const isVot3 = tk.symbol === VOT3.symbol
                        return (
                            <React.Fragment key={tk.symbol}>
                                <EnhancedTokenCard
                                    item={tk}
                                    onSelectedToken={handleTokenSelect}
                                    selected={_selectedToken.symbol === tk.symbol}
                                    disabled={isVot3}
                                    onDisabledPress={isVot3 ? handleVot3Press : undefined}
                                />
                                {isVot3 && vot3WarningVisible && (
                                    <BaseView style={styles.alertWrapper}>
                                        <AlertInline message={LL.SEND_VOT3_WARNING()} variant="banner" status="info" />
                                    </BaseView>
                                )}
                            </React.Fragment>
                        )
                    })}
                </BaseView>
                <BaseSpacer height={24} />
            </BaseBottomSheet>
        )
    },
)

const baseBottomSheetStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        rootContentBackground: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : theme.colors.actionBottomSheet.background,
        },
        alertWrapper: {
            width: "100%",
        },
    })

const baseTokenCardStyles =
    ({ selected }: { selected: boolean }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            root: {
                gap: 16,
                alignItems: "center",
                borderRadius: 12,
                justifyContent: "space-between",
                minHeight: 80,
                borderWidth: selected ? 2 : 0,
                borderColor: selected ? theme.colors.text : "transparent",
            },
            container: {
                borderRadius: 12,
            },
            leftSection: {
                flexGrow: 1,
                flexShrink: 1,
                minWidth: 0,
            },
            tokenInfo: {
                minWidth: 0,
            },
            balanceSection: {
                flexGrow: 0,
                flexShrink: 0,
                minWidth: 88,
            },
        })
