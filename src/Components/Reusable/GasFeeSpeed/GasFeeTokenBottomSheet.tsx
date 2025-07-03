import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { AnimatedTokenCard } from "~Screens/Flows/App/HomeScreen/Components/ListsView/Token/AnimatedTokenCard"
import {
    selectAllBalances,
    selectAllTokens,
    selectDefaultDelegationToken,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { setDefaultDelegationToken } from "~Storage/Redux/Slices/Delegation"
import { AddressUtils } from "~Utils"
import { CheckBoxWithText } from "../CheckBoxWithText"

type Props = {
    selectedToken: string
    setSelectedToken: (value: string) => void
    availableTokens: string[]
    onClose: () => void
    hasEnoughBalanceOnToken: {
        [token: string]: boolean
    }
}

const noop = () => {}

type EnhancedTokenCardProps = {
    item: FungibleTokenWithBalance
    onSelectedToken: (value: string) => void
    selected: boolean
    disabled: boolean
}
const EnhancedTokenCard = ({ item, selected, onSelectedToken, disabled }: EnhancedTokenCardProps) => {
    const { styles } = useThemedStyles(baseTokenCardStyles({ selected, disabled }))
    const onPress = useCallback(() => {
        if (!disabled) onSelectedToken(item.symbol)
    }, [disabled, item.symbol, onSelectedToken])

    return (
        <Pressable onPress={onPress} testID="GAS_FEE_TOKEN_BOTTOM_SHEET_TOKEN" disabled={disabled}>
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
    { selectedToken, setSelectedToken, onClose, availableTokens, hasEnoughBalanceOnToken },
    ref,
) {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    const [internalToken, setInternalToken] = useState(selectedToken)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const tokens = useAppSelector(selectAllTokens)
    const balances = useAppSelector(selectAllBalances)
    const defaultToken = useAppSelector(selectDefaultDelegationToken)
    const dispatch = useAppDispatch()

    const [isDefaultToken, setIsDefaultToken] = useState(false)

    const onApply = useCallback(() => {
        setSelectedToken(internalToken)
        if (internalToken !== defaultToken && isDefaultToken)
            dispatch(setDefaultDelegationToken({ genesisId: selectedNetwork.genesis.id, token: internalToken }))
        setIsDefaultToken(false)
        onClose()
    }, [defaultToken, dispatch, internalToken, isDefaultToken, onClose, selectedNetwork.genesis.id, setSelectedToken])

    const onCancel = useCallback(() => {
        setInternalToken(selectedToken)
        setIsDefaultToken(false)
        onClose()
    }, [onClose, selectedToken])

    const tokenList = useMemo(() => {
        return availableTokens.map(tk => {
            const foundToken = tokens.find(u => u.symbol === tk)!
            const balance = balances.find(b => AddressUtils.compareAddresses(b.tokenAddress, foundToken.address)) ?? {
                balance: "0",
                isHidden: false,
                timeUpdated: new Date().toISOString(),
                tokenAddress: foundToken.address,
            }
            return {
                ...foundToken,
                balance,
            }
        })
    }, [availableTokens, tokens, balances])

    const onCheckChanged = useCallback((newValue: boolean) => {
        setIsDefaultToken(newValue)
    }, [])

    return (
        <BaseBottomSheet
            ref={ref}
            dynamicHeight
            contentStyle={styles.rootContent}
            backgroundStyle={styles.rootContentBackground}>
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
                        disabled={!hasEnoughBalanceOnToken[tk.symbol]}
                    />
                ))}
            </BaseView>
            <BaseSpacer height={24} />
            {defaultToken !== internalToken && (
                <>
                    <CheckBoxWithText
                        text={LL.DELEGATE_FEE_TOKEN_CHECKBOX()}
                        checkAction={onCheckChanged}
                        isChecked={isDefaultToken}
                        checkboxTestID="GAS_FEE_TOKEN_BOTTOM_SHEET_DEFAULT_CHECKBOX"
                    />
                    <BaseSpacer height={24} />
                </>
            )}

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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        rootContentBackground: {
            backgroundColor: theme.colors.actionBottomSheet.background,
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
