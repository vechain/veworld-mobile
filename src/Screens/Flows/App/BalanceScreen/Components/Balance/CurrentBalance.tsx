import React, { useCallback, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated"
import { BaseText } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import {
    selectBalanceVisible,
    selectCurrencySymbol,
    selectSelectedAccount,
    setBalanceVisible,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { SlotMachineText } from "./SlotMachineText"

export const CurrentBalance = () => {
    const currencySymbol = useAppSelector(selectCurrencySymbol)
    const account = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const dispatch = useAppDispatch()

    const { styles } = useThemedStyles(baseStyles)
    const { renderedBalance } = useTotalFiatBalance({ address: account.address, enabled: true })

    const onPress = useCallback(() => {
        dispatch(setBalanceVisible(!isBalanceVisible))
    }, [dispatch, isBalanceVisible])

    const splittedText = useMemo(
        () => renderedBalance.replace(currencySymbol, "").split(""),
        [currencySymbol, renderedBalance],
    )

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={styles.root} layout={LinearTransition.duration(300)}>
                <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                    {currencySymbol}
                </BaseText>
                <Animated.View style={styles.balance}>
                    {splittedText.includes("•") ? (
                        <Animated.Text
                            entering={FadeIn.duration(300)}
                            exiting={FadeOut.duration(300)}
                            style={styles.text}>
                            {splittedText.join("")}
                        </Animated.Text>
                    ) : (
                        splittedText.map((value, idx) => <SlotMachineText key={idx} value={value} />)
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        text: {
            color: COLORS.GREY_50,
            fontWeight: 600,
            fontSize: 36,
            fontFamily: "Inter-SemiBold",
            lineHeight: 40,
        },
        root: {
            flexDirection: "row",
            alignSelf: "center",
            gap: 4,
            alignItems: "center",
        },
        hiddenText: {
            opacity: 0,
        },
        balance: {
            flexDirection: "row",
        },
    })
