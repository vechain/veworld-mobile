import { Pressable, StyleSheet, Text, View } from "react-native"
import React, { useCallback } from "react"
import { ColorThemeType, valueToHP } from "~Constants"
import { widthPercentageToDP as wp } from "react-native-responsive-screen"
import { useThemedStyles } from "~Hooks"
import { Icon } from "~Components"

const numPad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "blank", "0", "canc"]

type Props = {
    onDigitPress: (digit: string) => void
    onDigitDelete: () => void
}

export const StandaloneNumPad = ({ onDigitPress, onDigitDelete }: Props) => {
    const handleOnDigitPress = useCallback(
        (digit: string) => () => {
            onDigitPress(digit)
        },
        [onDigitPress],
    )

    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <View style={styles.container}>
            {numPad.map(digit => {
                const isDeleteKey = digit === "canc"
                const onPress = isDeleteKey ? onDigitDelete : handleOnDigitPress(digit)
                return (
                    <View style={styles.width} key={digit}>
                        {digit !== "blank" ? (
                            <Pressable
                                style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.5 : 1.0 }]}
                                onPress={onPress}>
                                {digit !== "canc" ? (
                                    <Text style={styles.digitText}>{digit}</Text>
                                ) : (
                                    <Icon size={22} name="icon-delete" color={theme.colors.text} />
                                )}
                            </Pressable>
                        ) : null}
                    </View>
                )
            })}
        </View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
        },
        width: {
            width: "33%",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: valueToHP[22],
        },
        pressable: {
            width: wp("18%"),
            height: wp("18%"),
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.card,
            borderRadius: wp("9%"),
        },
        digitText: {
            fontSize: 32,
            fontWeight: "bold",
            alignItems: "center",
            color: theme.colors.text,
        },
    })
