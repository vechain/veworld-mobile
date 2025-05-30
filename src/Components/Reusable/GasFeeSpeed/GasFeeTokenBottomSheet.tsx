import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { AnimatedTokenCard } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/AnimatedTokenCard"
import { selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

type Props = {
    selectedToken: string
    setSelectedToken: (value: string) => void
    availableTokens: string[]
    onClose: () => void
}

const noop = () => {}

type EnhancedTokenCardProps = {
    item: FungibleTokenWithBalance
    onSelectedToken: (value: string) => void
    selected: boolean
}
const EnhancedTokenCard = ({ item, selected, onSelectedToken }: EnhancedTokenCardProps) => {
    const disabled = useMemo(() => BigNutils(item.balance.balance).isZero, [item.balance.balance])
    const { styles } = useThemedStyles(baseTokenCardStyles({ selected, disabled }))
    const onPress = useCallback(() => {
        onSelectedToken(item.symbol)
    }, [item.symbol, onSelectedToken])

    return (
        <Pressable onPress={onPress}>
            <AnimatedTokenCard
                item={item}
                drag={noop}
                isEdit={false}
                isActive={false}
                isBalanceVisible
                rootStyle={styles.rootContent}
            />
        </Pressable>
    )
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

    const onCancel = useCallback(() => {
        setInternalToken(selectedToken)
        onClose()
    }, [onClose, selectedToken])

    const tokenList = useMemo(() => {
        return availableTokens.map(tk => tokens.find(u => u.symbol === tk)!)
    }, [tokens, availableTokens])

    const onDismiss = useCallback(() => {
        setInternalToken(selectedToken)
    }, [selectedToken])

    return (
        <BaseBottomSheet ref={ref} dynamicHeight contentStyle={styles.rootContent} onDismiss={onDismiss}>
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
                    <EnhancedTokenCard
                        item={tk}
                        key={tk.symbol}
                        onSelectedToken={setInternalToken}
                        selected={internalToken === tk.symbol}
                    />
                ))}
            </BaseView>
            <BaseSpacer height={24} />
            <BaseView gap={16} flexDirection="row" w={100}>
                <BaseButton variant="outline" action={onCancel} flex={1} testID="GAS_FEE_TOKEN_BOTTOM_SHEET_CANCEL">
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

const baseTokenCardStyles =
    ({ selected, disabled }: { selected: boolean; disabled: boolean }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            rootContent: {
                borderWidth: selected ? 2 : 0,
                borderColor: theme.colors.text,
                backgroundColor: disabled ? theme.colors.editSpeedBs.result.background : theme.colors.card,
            },
        })
