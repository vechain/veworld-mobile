import React from "react"
import { StyleSheet, View } from "react-native"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { BaseIcon, BaseSpacer } from "~Components"

type Props = {
    index: number
    action: () => void
}

export const SwipeableUnderlay = ({ action, index }: Props) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseUnderlayStyles)
    return (
        <View style={styles.underlayContainer}>
            <BaseSpacer width={20} />
            <View style={styles.underlayLeft}>
                <BaseIcon
                    name={"delete"}
                    size={20}
                    bg={theme.colors.danger}
                    color={theme.colors.card}
                    action={action}
                    testID={`BaseUnderlay_deleteIcon-${index}`}
                />
            </View>
        </View>
    )
}

const baseUnderlayStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underlayLeft: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            justifyContent: "flex-end",
            borderRadius: 16,
            height: 57,
            marginVertical: 8,
            paddingRight: 10,
            backgroundColor: theme.colors.danger,
        },
        underlayContainer: {
            flexDirection: "row",
        },
    })
