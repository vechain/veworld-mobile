import React, { useCallback, useMemo, useRef, useState } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    ChangeAccountButtonPill,
    Layout,
    SelectAccountBottomSheet,
} from "~Components"
import { VET } from "~Constants"
import { ColorThemeType } from "~Constants/Theme"
import { useAmountInput, useBottomSheetModal, useSetSelectedAccount, useTheme, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useSwapQuote } from "~Hooks/useSwap"
import { SwapTokenSelector } from "./components/SwapTokenSelector"
import { SwapQuoteDisplay } from "./components/SwapQuoteDisplay"
import { SwapSlippageSettings } from "./components/SwapSlippageSettings"
import { SwapTokenSelectionBottomSheet } from "./components/SwapTokenSelectionBottomSheet"
import { useSwapTokens } from "~Hooks/useSwap"
import { ethers } from "ethers"
import HapticsService from "~Services/HapticsService"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SWAP>

export const NativeSwapScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation<NavigationProps>()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const accounts = useAppSelector(selectVisibleAccounts)
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { tokensWithBalance } = useSwapTokens()

    const defaultFromToken = useMemo(() => {
        return tokensWithBalance.find(t => t.address === VET.address) ?? tokensWithBalance[0]
    }, [tokensWithBalance])

    const [fromToken, setFromToken] = useState<FungibleTokenWithBalance | undefined>(undefined)
    const [toToken, setToToken] = useState<FungibleTokenWithBalance | undefined>(undefined)
    const [slippageBasisPoints, setSlippageBasisPoints] = useState(50)
    const [isError, setIsError] = useState(false)

    const activeFromToken = fromToken ?? defaultFromToken

    // Amount input — same pattern as ConvertBetterBottomSheet
    const { input: humanInput, setInput: setHumanInput, removeInvalidCharacters } = useAmountInput("")

    // Convert human-readable input to raw (wei) for the quote hook
    const rawAmount = useMemo(() => {
        if (!humanInput || !activeFromToken) return ""
        try {
            const parsable = humanInput.endsWith(".") ? `${humanInput}0` : humanInput
            if (parsable === "0") return ""
            return ethers.utils.parseUnits(parsable, activeFromToken.decimals).toString()
        } catch {
            return ""
        }
    }, [humanInput, activeFromToken])

    const onChangeText = useCallback(
        (newValue: string) => {
            if (!activeFromToken) return
            const cleaned = removeInvalidCharacters(newValue)
            setHumanInput(cleaned)

            if (cleaned === "" || BigNutils(cleaned).isZero) {
                setIsError(false)
                return
            }

            try {
                const parsable = cleaned.endsWith(".") ? `${cleaned}0` : cleaned
                const realValue = ethers.utils.parseUnits(parsable, activeFromToken.decimals).toString()
                const balance = BigNutils(activeFromToken.balance?.balance).toString

                if (BigNutils(realValue).isBiggerThan(balance)) {
                    setIsError(true)
                    HapticsService.triggerNotification({ level: "Error" })
                } else {
                    setIsError(false)
                }
            } catch {
                setIsError(false)
            }
        },
        [activeFromToken, removeInvalidCharacters, setHumanInput],
    )

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottomSheet,
    } = useBottomSheetModal()

    const slippageBottomSheetRef = useRef<BottomSheetModalMethods>(null)
    const fromTokenBottomSheetRef = useRef<BottomSheetModalMethods>(null)
    const toTokenBottomSheetRef = useRef<BottomSheetModalMethods>(null)

    const [selectingTokenFor, setSelectingTokenFor] = useState<"from" | "to">("from")

    const { quote, isLoading: isQuoteLoading } = useSwapQuote({
        fromToken: activeFromToken,
        toToken,
        amount: rawAmount,
        slippageBasisPoints,
    })

    const handleFlipTokens = useCallback(() => {
        setFromToken(toToken)
        setToToken(activeFromToken)
        setHumanInput("")
        setIsError(false)
    }, [activeFromToken, toToken, setHumanInput])

    const handleOpenFromTokenSelector = useCallback(() => {
        Keyboard.dismiss()
        setSelectingTokenFor("from")
        fromTokenBottomSheetRef.current?.present()
    }, [])

    const handleOpenToTokenSelector = useCallback(() => {
        Keyboard.dismiss()
        setSelectingTokenFor("to")
        toTokenBottomSheetRef.current?.present()
    }, [])

    const handleTokenSelected = useCallback(
        (token: FungibleTokenWithBalance) => {
            if (selectingTokenFor === "from") {
                if (toToken && token.address === toToken.address) {
                    setToToken(activeFromToken)
                }
                setFromToken(token)
                setHumanInput("")
                setIsError(false)
            } else {
                if (activeFromToken && token.address === activeFromToken.address) {
                    setFromToken(toToken)
                }
                setToToken(token)
            }
            fromTokenBottomSheetRef.current?.dismiss()
            toTokenBottomSheetRef.current?.dismiss()
        },
        [selectingTokenFor, activeFromToken, toToken, setHumanInput],
    )

    const handleMax = useCallback(() => {
        if (!activeFromToken?.balance?.balance) return
        const human = ethers.utils.formatUnits(activeFromToken.balance.balance, activeFromToken.decimals)
        onChangeText(human)
    }, [activeFromToken, onChangeText])

    const isSwapDisabled = useMemo(() => {
        if (!activeFromToken || !toToken || !rawAmount) return true
        if (isError) return true
        if (!quote) return true
        return false
    }, [activeFromToken, toToken, rawAmount, isError, quote])

    const handleReviewSwap = useCallback(() => {
        if (!quote) return
        Keyboard.dismiss()
        nav.navigate(Routes.NATIVE_SWAP_CONFIRMATION, { quote })
    }, [nav, quote])

    const handleOpenSlippage = useCallback(() => {
        Keyboard.dismiss()
        slippageBottomSheetRef.current?.present()
    }, [])

    if (!activeFromToken) return null

    return (
        <Layout
            safeAreaTestID="Native_Swap_Screen"
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            title={LL.SWAP_TITLE()}
            headerRightElement={<ChangeAccountButtonPill action={openSelectAccountBottomSheet} />}
            body={
                <BaseView flex={1}>
                    <BaseSpacer height={8} />

                    {/* Token cards — same style as ConvertBetter */}
                    <BaseView style={styles.cardContainer}>
                        <SwapTokenSelector
                            label={LL.SWAP_NATIVE_FROM()}
                            token={activeFromToken}
                            amount={humanInput}
                            onAmountChange={onChangeText}
                            onTokenPress={handleOpenFromTokenSelector}
                            onMax={handleMax}
                            editable
                            isError={isError}
                        />

                        {/* Flip button — centered between cards */}
                        <BaseView style={styles.switchButtonContainer}>
                            <TouchableOpacity
                                testID="Swap_Flip_Button"
                                style={styles.switchButtonTapArea}
                                activeOpacity={0.5}
                                onPress={handleFlipTokens}>
                                <BaseView style={styles.switchButton}>
                                    <BaseIcon
                                        color={theme.colors.convertBetterCard.swapIcon}
                                        name="icon-arrow-up-down"
                                        size={16}
                                    />
                                </BaseView>
                            </TouchableOpacity>
                        </BaseView>

                        <SwapTokenSelector
                            label={LL.SWAP_NATIVE_TO()}
                            token={toToken}
                            amount={quote?.amountOut ?? ""}
                            onTokenPress={handleOpenToTokenSelector}
                            editable={false}
                            isLoading={isQuoteLoading}
                        />
                    </BaseView>

                    <BaseSpacer height={12} />

                    {/* Quote details */}
                    {quote && (
                        <SwapQuoteDisplay
                            quote={quote}
                            slippageBasisPoints={slippageBasisPoints}
                            onSlippagePress={handleOpenSlippage}
                        />
                    )}

                    {isQuoteLoading && !quote && humanInput !== "" && (
                        <BaseText typographyFont="caption" align="center" color={theme.colors.subtitle}>
                            {LL.SWAP_NATIVE_FETCHING_QUOTE()}
                        </BaseText>
                    )}

                    {isError && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseText typographyFont="caption" align="center" color={theme.colors.danger}>
                                {LL.SWAP_NATIVE_INSUFFICIENT_BALANCE({ symbol: activeFromToken.symbol })}
                            </BaseText>
                        </>
                    )}

                    <BaseSpacer height={24} />

                    <BaseButton
                        testID="review-swap-button"
                        title={LL.SWAP_NATIVE_REVIEW_SWAP()}
                        disabled={isSwapDisabled}
                        action={handleReviewSwap}
                    />

                    <BaseSpacer height={20} />

                    {/* Bottom sheets */}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottomSheet}
                        accounts={accounts}
                        setSelectedAccount={onSetSelectedAccount}
                        selectedAccount={selectedAccount}
                        ref={selectAccountBottomSheetRef}
                    />

                    <SwapTokenSelectionBottomSheet
                        ref={fromTokenBottomSheetRef}
                        tokens={tokensWithBalance}
                        selectedToken={selectingTokenFor === "from" ? activeFromToken : toToken}
                        onTokenSelected={handleTokenSelected}
                    />

                    <SwapTokenSelectionBottomSheet
                        ref={toTokenBottomSheetRef}
                        tokens={tokensWithBalance}
                        selectedToken={selectingTokenFor === "to" ? toToken : activeFromToken}
                        onTokenSelected={handleTokenSelected}
                    />

                    <SwapSlippageSettings
                        ref={slippageBottomSheetRef}
                        slippageBasisPoints={slippageBasisPoints}
                        onSlippageChange={setSlippageBasisPoints}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            gap: 8,
            flexDirection: "column",
        },
        switchButtonContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "box-none",
            zIndex: 1,
        },
        switchButtonTapArea: {
            padding: 12,
        },
        switchButton: {
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            color: theme.colors.convertBetterCard.swapIcon,
            padding: 8,
            borderRadius: 6,
            width: 32,
            height: 32,
        },
    })
