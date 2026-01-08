import React, { useCallback, useMemo } from "react"
import { PixelRatio, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseText } from "~Components"
import { useDevice } from "~Components/Providers/DeviceProvider"
import { COLORS, SYMBOL_POSITIONS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useTotalFiatBalance } from "~Hooks/useTotalFiatBalance"
import {
    selectBalanceVisible,
    selectCurrencySymbol,
    selectSelectedAccount,
    selectSymbolPosition,
    setBalanceVisible,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import FontUtils from "~Utils/FontUtils"
import { SlotMachineText } from "./SlotMachineText"

export const CurrentBalance = () => {
    const currencySymbol = useAppSelector(selectCurrencySymbol)
    const currencyPosition = useAppSelector(selectSymbolPosition)
    const account = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const dispatch = useAppDispatch()

    const { styles } = useThemedStyles(baseStyles)
    const { renderedBalance } = useTotalFiatBalance({
        address: account.address,
        enabled: true,
        useCompactNotation: false,
    })
    const { isLowEndDevice } = useDevice()

    const onPress = useCallback(() => {
        dispatch(setBalanceVisible(!isBalanceVisible))
    }, [dispatch, isBalanceVisible])

    const splittedText = useMemo(
        () => renderedBalance.replace(currencySymbol, "").replace(" ", "").split(""),
        [currencySymbol, renderedBalance],
    )

    // Check if balance uses compact notation (K, M, B, T) or less-than notation (<)
    // These are not suitable for slot machine animation
    const hasCompactOrSpecialNotation = useMemo(() => /[KMBT<]/.test(renderedBalance), [renderedBalance])

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={styles.root} layout={LinearTransition.duration(300)}>
                {currencyPosition === SYMBOL_POSITIONS.BEFORE && (
                    <BaseText
                        typographyFont="headerTitle"
                        fontWeight="400"
                        color={COLORS.PURPLE_LABEL}
                        style={styles.currency}>
                        {currencySymbol}
                    </BaseText>
                )}

                <Animated.View style={styles.balance}>
                    {splittedText.includes("•") || isLowEndDevice || hasCompactOrSpecialNotation ? (
                        <Text style={styles.text}>{splittedText.join("")}</Text>
                    ) : (
                        splittedText.map((value, idx) => <SlotMachineText key={idx} value={value} />)
                    )}
                </Animated.View>
                {currencyPosition === SYMBOL_POSITIONS.AFTER && (
                    <BaseText
                        typographyFont="headerTitle"
                        fontWeight="400"
                        color={COLORS.PURPLE_LABEL}
                        style={styles.currency}>
                        {currencySymbol}
                    </BaseText>
                )}
            </Animated.View>
        </TouchableOpacity>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        text: {
            color: COLORS.GREY_50,
            fontWeight: 600,
            fontSize: FontUtils.font(36),
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
            minHeight: 46 * PixelRatio.getFontScale(),
        },
        currency: {
            height: 40 * PixelRatio.getFontScale(),
            alignItems: "center",
            verticalAlign: "middle",
        },
    })
