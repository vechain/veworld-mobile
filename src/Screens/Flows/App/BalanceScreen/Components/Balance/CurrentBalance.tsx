import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
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
import { RollingFadingText } from "../RollingFadingText"

export const CurrentBalance = () => {
    const currencySymbol = useAppSelector(selectCurrencySymbol)
    const account = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const dispatch = useAppDispatch()

    const [isLoading, setIsLoading] = useState(false)

    const { styles } = useThemedStyles(baseStyles)
    const { renderedBalance } = useTotalFiatBalance({ account, enabled: true })

    const onPress = useCallback(() => {
        dispatch(setBalanceVisible(!isBalanceVisible))
    }, [dispatch, isBalanceVisible])

    useEffect(() => {
        const intervalId = setInterval(() => setIsLoading(old => !old), 4000)
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    return (
        <TouchableOpacity style={styles.root} onPress={onPress}>
            <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                {currencySymbol}
            </BaseText>
            {/* This is just a placeholder for the loading state. Update it accordingly */}
            {isLoading ? (
                <RollingFadingText text="99.999" />
            ) : (
                <Animated.Text style={styles.text} entering={FadeIn.duration(600)} exiting={FadeOut.duration(600)}>
                    {renderedBalance.replace(currencySymbol, "")}
                </Animated.Text>
            )}
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
    })
