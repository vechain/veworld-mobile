import React from "react"
import { StyleSheet } from "react-native"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseIcon, BaseTouchable, BaseView } from "~Components/Base"

type Props = { onPress?: () => void }
export const DeleteUnderlay: React.FC<Props> = ({ onPress }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const handlePress = () => {
        onPress && onPress()
    }

    return (
        <BaseView style={styles.underlayContainer}>
            <BaseView style={styles.underlayLeft}>
                <BaseTouchable action={handlePress}>
                    <BaseIcon
                        name={"delete"}
                        size={24}
                        bg={theme.colors.danger}
                        color={theme.colors.card}
                        style={styles.deleteIcon}
                    />
                </BaseTouchable>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underlayContainer: {
            flexDirection: "row",
            height: "100%",
        },
        underlayLeft: {
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            marginLeft: "auto",
            borderRadius: 16,
            height: "100%",
            backgroundColor: theme.colors.danger,
        },
        deleteIcon: { marginRight: 10 },
    })
