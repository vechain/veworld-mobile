import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { BaseText, BaseView } from "~Components"
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
    const { renderedBalance, isLoading } = useTotalFiatBalance({ account, enabled: true })

    const [dddddddd, setValue] = useState(Math.random().toFixed(2))

    const onPress = useCallback(() => {
        dispatch(setBalanceVisible(!isBalanceVisible))
    }, [dispatch, isBalanceVisible])

    const splittedText = useMemo(() => dddddddd.replace(currencySymbol, "").split(""), [currencySymbol, dddddddd])

    useEffect(() => {
        const interval = setInterval(() => setValue((Math.random() * 100).toFixed(2)), 5000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={styles.root} layout={LinearTransition}>
                <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                    {currencySymbol}
                </BaseText>
                <BaseView flexDirection="row">
                    {splittedText.map((value, idx, arr) => (
                        <SlotMachineText key={idx} value={value} />
                    ))}
                </BaseView>
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
    })
