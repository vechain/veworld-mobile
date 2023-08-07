import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { useSwipeableItemParams } from "react-native-swipeable-item"
import { useTheme, useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseIcon, BaseView } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import HapticsService from "~Services/HapticsService"

type Props = {
    onDelete: (token: FungibleTokenWithBalance) => void
}

export const UnderlayLeft = ({ onDelete }: Props) => {
    const { close, item: token } =
        useSwipeableItemParams<FungibleTokenWithBalance>()

    const theme = useTheme()

    const { styles } = useThemedStyles(baseStyles)

    const handleDelete = useCallback(() => {
        onDelete(token)

        HapticsService.triggerImpact({ level: "Light" })

        close()
    }, [close, onDelete, token])

    return (
        <BaseView style={styles.underlayContainer}>
            <BaseView style={styles.underlayLeft}>
                <TouchableOpacity onPress={handleDelete}>
                    <BaseIcon
                        name={"delete"}
                        size={24}
                        bg={theme.colors.danger}
                        color={theme.colors.card}
                        style={styles.deleteIcon}
                    />
                </TouchableOpacity>
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
