import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { AnimatedTokenCard } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/AnimatedTokenCard"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"

type Props = {
    selectedToken: string
    setSelectedToken: (value: string) => void
    availableTokens: string[]
    onClose: () => void
}

export const GasFeeTokenBottomSheet = forwardRef<BottomSheetModalMethods, Props>(function GasFeeSpeedBottomSheet(
    { selectedToken, setSelectedToken, onClose, availableTokens },
    ref,
) {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const [internalToken, setInternalToken] = useState(selectedToken)
    const tokens = useAppSelector(selectTokensWithBalances)

    const onApply = useCallback(() => {
        setSelectedToken(internalToken)
        onClose()
    }, [internalToken, onClose, setSelectedToken])

    const tokenList = useMemo(() => tokens.filter(tk => availableTokens.includes(tk.symbol)), [tokens, availableTokens])

    return (
        <BaseBottomSheet ref={ref} dynamicHeight contentStyle={styles.rootContent}>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon name="icon-coins" size={20} color={theme.colors.editSpeedBs.title} />
                <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                    {LL.DELEGATE_FEE_TOKEN_TITLE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={8} />
            <BaseText typographyFont="buttonSecondary" color={theme.colors.editSpeedBs.subtitle}>
                {LL.DELEGATE_FEE_TOKEN_DESC()}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseView flexDirection="column" gap={8}>
                {tokenList.map(tk => (
                    <AnimatedTokenCard
                        item={tk}
                        drag={() => setInternalToken(tk.symbol)}
                        isEdit={false}
                        isActive
                        isBalanceVisible
                        key={tk.symbol}
                    />
                ))}
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView gap={16} flexDirection="row" w={100}>
                <BaseButton variant="outline" action={onClose} flex={1} testID="GAS_FEE_TOKEN_BOTTOM_SHEET_CANCEL">
                    {LL.COMMON_BTN_CANCEL()}
                </BaseButton>
                <BaseButton action={onApply} flex={1} testID="GAS_FEE_TOKEN_BOTTOM_SHEET_APPLY">
                    {LL.COMMON_BTN_APPLY()}
                </BaseButton>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
    })
