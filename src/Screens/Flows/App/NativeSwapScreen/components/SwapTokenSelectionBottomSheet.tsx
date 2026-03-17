import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, VeDelegate } from "~Constants"
import { ColorThemeType, typography } from "~Constants/Theme"
import { useBalances, useCombineFiatBalances, useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { formatTokenAmount } from "~Utils/StandardizedFormatting"
import { useI18nContext } from "~i18n"

type SwapTokenSelectionBottomSheetProps = {
    tokens: FungibleTokenWithBalance[]
    selectedToken: FungibleTokenWithBalance | undefined
    onTokenSelected: (token: FungibleTokenWithBalance) => void
}

type TokenCardProps = {
    item: FungibleTokenWithBalance
    onSelect: (token: FungibleTokenWithBalance) => void
    selected: boolean
}

const SwapTokenCard = ({ item, onSelect, selected }: TokenCardProps) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(tokenCardStyles({ selected }))
    const currency = useAppSelector(selectCurrency)
    const { formatLocale } = useFormatFiat()
    const name = useTokenDisplayName(item)
    const isCrossChainToken = useMemo(() => !!item.crossChainProvider, [item.crossChainProvider])

    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[item.symbol]
        if (coingeckoId) return coingeckoId
        if (item.symbol === VeDelegate.symbol) return getCoinGeckoIdBySymbol[B3TR.symbol]
        return item.symbol
    }, [item.symbol])

    const { data: exchangeRate } = useExchangeRate({ vs_currency: currency, id: exchangeRateId })

    const { fiatBalance } = useBalances({ token: item, exchangeRate: exchangeRate ?? 0 })
    const { combineFiatBalances } = useCombineFiatBalances()
    const { amount, areAlmostZero } = useMemo(() => combineFiatBalances([fiatBalance]), [combineFiatBalances, fiatBalance])

    const { formatFiat } = useFormatFiat()
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

    const onPress = useCallback(() => onSelect(item), [item, onSelect])

    return (
        <BaseTouchableBox
            action={onPress}
            testID={`SwapTokenSelect_${item.symbol}`}
            py={typography.lineHeight.body}
            flexDirection="row"
            bg={theme.colors.card}
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
                <BaseView flexDirection="column" flexGrow={0} gap={3} flexShrink={1}>
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.activityCard.title}>
                        {name}
                    </BaseText>
                    <BaseText typographyFont="captionSemiBold" color={theme.colors.activityCard.subtitleLight}>
                        {item.symbol}
                    </BaseText>
                </BaseView>
            </BaseView>

            <BaseView flexDirection="column" alignItems="flex-end" style={styles.balanceSection}>
                {exchangeRate ? (
                    <>
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.activityCard.title} align="right">
                            {renderFiatBalance}
                        </BaseText>
                        <BaseText typographyFont="captionSemiBold" color={theme.colors.activityCard.subtitleLight} align="right">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText typographyFont="bodySemiBold" color={theme.colors.activityCard.title} align="right">
                        {tokenBalance}
                    </BaseText>
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

export const SwapTokenSelectionBottomSheet = React.forwardRef<BottomSheetModalMethods, SwapTokenSelectionBottomSheetProps>(
    function SwapTokenSelectionBottomSheet({ tokens, selectedToken, onTokenSelected }, ref) {
        const { LL } = useI18nContext()
        const { theme, styles } = useThemedStyles(bottomSheetStyles)

        return (
            <BaseBottomSheet ref={ref} dynamicHeight contentStyle={styles.content} backgroundStyle={styles.background}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-coins" size={20} color={theme.colors.text} />
                    <BaseText typographyFont="subTitleSemiBold">{LL.SWAP_NATIVE_SELECT_TOKEN()}</BaseText>
                </BaseView>
                <BaseSpacer height={16} />
                <BaseView flexDirection="column" gap={8}>
                    {tokens.map(token => (
                        <SwapTokenCard
                            key={`${token.address}-${token.symbol}`}
                            item={token}
                            onSelect={onTokenSelected}
                            selected={selectedToken?.address === token.address}
                        />
                    ))}
                </BaseView>
                <BaseSpacer height={24} />
            </BaseBottomSheet>
        )
    },
)

const bottomSheetStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        content: {
            paddingBottom: 40,
        },
        background: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : theme.colors.card,
        },
    })

const tokenCardStyles =
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
            balanceSection: {
                flexGrow: 0,
                flexShrink: 0,
                minWidth: 88,
            },
        })
