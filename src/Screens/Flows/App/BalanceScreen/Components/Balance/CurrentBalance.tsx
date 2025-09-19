import React, { useCallback, useMemo } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeOut, LinearTransition } from "react-native-reanimated"
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
import { RollingFadingTextElement } from "../RollingFadingText"

export const CurrentBalance = () => {
    const currencySymbol = useAppSelector(selectCurrencySymbol)
    const account = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const dispatch = useAppDispatch()

    const { styles } = useThemedStyles(baseStyles)
    const { renderedBalance, isLoading } = useTotalFiatBalance({ account, enabled: true })

    const onPress = useCallback(() => {
        dispatch(setBalanceVisible(!isBalanceVisible))
    }, [dispatch, isBalanceVisible])

    const splittedText = useMemo(
        () => renderedBalance.replace(currencySymbol, "").split(""),
        [currencySymbol, renderedBalance],
    )

    return (
        <TouchableOpacity onPress={onPress}>
            <Animated.View style={styles.root} layout={LinearTransition}>
                <BaseText typographyFont="headerTitle" fontWeight="400" color={COLORS.PURPLE_LABEL}>
                    {currencySymbol}
                </BaseText>
                <BaseView flexDirection="row">
                    {splittedText.map((value, idx, arr) =>
                        isLoading ? (
                            <Animated.Text style={styles.text} key={idx} exiting={FadeOut.duration(600)}>
                                {value}
                            </Animated.Text>
                        ) : (
                            <RollingFadingTextElement
                                key={idx}
                                value={value}
                                index={idx}
                                totalChars={arr.length}
                                repetition={1}
                                half
                            />
                        ),
                    )}
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
