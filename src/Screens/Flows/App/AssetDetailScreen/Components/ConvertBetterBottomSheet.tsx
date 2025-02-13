import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ConvertBetterCard } from "./ConvertBetterCard"
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { StyleSheet } from "react-native"
import { ColorThemeType } from "~Constants"
import { TouchableOpacity } from "react-native-gesture-handler"

type Props = {
    onConfirm: () => void
}

export const ConvertBetterBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onConfirm }, ref) => {
    const [sendAmount, setSendAmount] = useState("0")

    const { styles } = useThemedStyles(baseStyles)

    const { B3TR, VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))

    const activeSender = useSharedValue<string>(B3TR.symbol)
    const b3trToken = useTokenWithCompleteInfo(B3TR)
    const vot3Token = useTokenWithCompleteInfo(VOT3)

    const animatedStyles = useAnimatedStyle(() => {
        return {
            flexDirection: activeSender.value === B3TR.symbol ? "column" : "column-reverse",
        }
    }, [activeSender])

    const onSwitchCurrencyPress = () => {
        if (activeSender.value === B3TR.symbol) {
            activeSender.value = VOT3.symbol
        } else {
            activeSender.value = B3TR.symbol
        }
    }

    const isSender = useCallback(
        (symbol: string) => {
            return activeSender.value === symbol
        },
        [activeSender.value],
    )

    const onConvertPress = useCallback(() => {
        setSendAmount("0")
        onConfirm()
    }, [onConfirm])

    return (
        <BaseBottomSheet ref={ref} blurBackdrop dynamicHeight enablePanDownToClose>
            <BaseView>
                <BaseText>{"Convert your Better tokens"}</BaseText>
                <BaseText>
                    {
                        // eslint-disable-next-line max-len
                        "B3TR tokens can be converted into VOT3 tokens and back, allowing you get more voting power and participate actively on the voting rounds and governance proposals. "
                    }
                </BaseText>

                <BaseSpacer height={24} />

                {/* Animated Card View */}
                <Animated.View style={[styles.betterCardContainer, animatedStyles]}>
                    <ConvertBetterCard
                        token={b3trToken}
                        isSender={isSender(B3TR.symbol)}
                        sendAmount={sendAmount}
                        onSendAmountChange={amount => setSendAmount(amount)}
                    />

                    <BaseView style={[styles.switchButtonContainer]}>
                        <TouchableOpacity
                            style={[styles.switchButton]}
                            activeOpacity={0.5}
                            onPress={onSwitchCurrencyPress}>
                            <BaseIcon name="icon-arrow-up-down" />
                        </TouchableOpacity>
                    </BaseView>

                    <ConvertBetterCard
                        token={vot3Token}
                        isSender={isSender(VOT3.symbol)}
                        sendAmount={sendAmount}
                        onSendAmountChange={amount => setSendAmount(amount)}
                    />
                </Animated.View>

                <BaseSpacer height={12} />

                <BaseText>{"Convert your Better tokens"}</BaseText>
                <BaseText>{"VTHO balance is required to pay for the conversion gas fees"}</BaseText>

                <BaseSpacer height={24} />
                <BaseButton
                    testID="Convert_Action_BTN"
                    title="Convert"
                    disabled={sendAmount === "0"}
                    action={onConvertPress}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
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
            padding: 8,
            borderRadius: 6,
        },
    })
