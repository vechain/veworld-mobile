import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ConvertBetterCard } from "./ConvertBetterCard"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import {
    selectB3trTokenWithBalance,
    selectSelectedAccount,
    selectVot3TokenWithBalance,
    useAppSelector,
} from "~Storage/Redux"
import { useAmountInput, useConvertBetterTokens, useThemedStyles, useTotalTokenBalance } from "~Hooks"
import { StyleSheet } from "react-native"
import { B3TR, ColorThemeType } from "~Constants"
import { TouchableOpacity } from "react-native-gesture-handler"
import { BigNutils } from "~Utils"
import HapticsService from "~Services/HapticsService"
import { useI18nContext } from "~i18n"

type Props = {
    onClose: () => void
}

export const ConvertBetterBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { input, setInput, removeInvalidCharacters } = useAmountInput("")
    const [isSwapped, setIsSwapped] = useState(false)
    const [isSwapEnabled, setIsSwapEnabled] = useState(true)
    const [isError, setIsError] = useState(false)

    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const cardPosition = useSharedValue(0)

    const b3trWithBalance = useAppSelector(selectB3trTokenWithBalance)
    const vot3WithBalance = useAppSelector(selectVot3TokenWithBalance)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const timer = useRef<NodeJS.Timeout | null>(null)

    const B3TRanimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(cardPosition.value ? 105 : 0, { duration: 300 }) }],
    }))

    const VOT3animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(cardPosition.value ? -105 : 0, { duration: 300 }) }],
    }))

    const { tokenTotalBalance: b3trTokenTotal } = useTotalTokenBalance(b3trWithBalance!, "1", selectedAccount.address)
    const { tokenTotalBalance: vot3TokenTotal } = useTotalTokenBalance(vot3WithBalance!, "1", selectedAccount.address)

    const { convertB3tr, convertVot3 } = useConvertBetterTokens()

    const isB3TRActive = !isSwapped

    const submitDisabled = useMemo(() => isError || !input, [input, isError])

    const onAnimationEnd = () => {
        setIsSwapEnabled(true)
    }

    const resetStates = useCallback(() => {
        setIsSwapEnabled(true)
        setInput("")
        cardPosition.value = 0
        setIsSwapped(false)
        setIsError(false)
    }, [cardPosition, setInput])

    const onChangeText = useCallback(
        (newValue: string) => {
            const _newValue = removeInvalidCharacters(newValue)
            setInput(_newValue)

            if (_newValue === "" || BigNutils(_newValue).isZero) {
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                setIsError(false)

                return
            }

            const balanceToHuman = BigNutils((isB3TRActive ? b3trTokenTotal : vot3TokenTotal) ?? "1").toHuman(
                B3TR.decimals,
            )

            const controlValue = BigNutils(_newValue).addTrailingZeros(B3TR.decimals).toHuman(B3TR.decimals)

            if (controlValue.isBiggerThan(balanceToHuman.toString)) {
                setIsError(true)
                HapticsService.triggerNotification({ level: "Error" })
            } else {
                setIsError(false)
            }
        },
        [b3trTokenTotal, isB3TRActive, removeInvalidCharacters, setInput, vot3TokenTotal],
    )

    const onMaxAmountPress = useCallback(
        (maxAmount: string) => {
            const _newValue = removeInvalidCharacters(maxAmount)
            setInput(_newValue)
        },
        [removeInvalidCharacters, setInput],
    )

    const onSwitchCurrencyPress = useCallback(() => {
        setIsSwapped(!isSwapped)
        cardPosition.value = withTiming(isSwapped ? 0 : 1, { duration: 10 }, () => {
            runOnJS(onAnimationEnd)()
        })
        setInput("")
        setIsError(false)
    }, [cardPosition, isSwapped, setInput])

    const onDismiss = useCallback(() => {
        resetStates()
    }, [resetStates])

    const onConvertPress = useCallback(() => {
        onClose()
        if (isB3TRActive) {
            convertB3tr(input)
        } else {
            convertVot3(input)
        }
        // resetStates()
    }, [convertB3tr, convertVot3, input, isB3TRActive, onClose])

    if (!b3trWithBalance || !vot3WithBalance) return <></>

    return (
        <BaseBottomSheet
            ref={ref}
            backgroundStyle={styles.bottomSheetStyle}
            blurBackdrop
            dynamicHeight
            enablePanDownToClose
            onDismiss={onDismiss}>
            <BaseView>
                <BaseText typographyFont="subSubTitleMedium">{LL.TITLE_CONVERT_BETTER_TOKENS()}</BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="captionRegular" color={theme.colors.subtitle}>
                    {LL.BD_BETTER_TOKEN_CONVERSION()}
                </BaseText>

                <BaseSpacer height={24} />

                {/* Animated Card View */}
                <Animated.View style={[styles.betterCardContainer]}>
                    <ConvertBetterCard
                        token={b3trWithBalance}
                        isSender={!isSwapped}
                        sendAmount={input}
                        error={isError}
                        animatedStyle={B3TRanimatedStyle}
                        onSendAmountChange={onChangeText}
                        onMaxAmountPress={onMaxAmountPress}
                    />

                    <BaseView style={[styles.switchButtonContainer]}>
                        <TouchableOpacity
                            disabled={!isSwapEnabled}
                            style={[styles.switchButton]}
                            activeOpacity={0.5}
                            onPress={onSwitchCurrencyPress}>
                            <BaseIcon color={theme.colors.convertBetterCard.swapIcon} name="icon-arrow-up-down" />
                        </TouchableOpacity>
                    </BaseView>

                    <ConvertBetterCard
                        token={vot3WithBalance}
                        isSender={isSwapped}
                        sendAmount={input}
                        error={isError}
                        animatedStyle={VOT3animatedStyle}
                        onSendAmountChange={onChangeText}
                        onMaxAmountPress={onMaxAmountPress}
                    />
                </Animated.View>

                <BaseSpacer height={12} />

                <BaseText typographyFont="smallCaptionSemiBold" color={theme.colors.subSubtitle}>
                    {LL.BD_BETTER_TOKEN_CONVERSION_RATIO()}
                </BaseText>
                <BaseText typographyFont="smallCaption" color={theme.colors.subtitle}>
                    {LL.BD_GAS_REQUIRED_FOR_CONVERSION()}
                </BaseText>

                <BaseSpacer height={24} />
                <BaseButton
                    testID="Convert_Action_BTN"
                    title={LL.BTN_CONVERT()}
                    disabled={submitDisabled}
                    action={onConvertPress}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        bottomSheetStyle: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        betterCardContainer: {
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
        switchButton: {
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            color: theme.colors.convertBetterCard.swapIcon,
            padding: 8,
            borderRadius: 6,
        },
    })
