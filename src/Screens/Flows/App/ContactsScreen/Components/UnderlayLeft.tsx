import React, { useCallback } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { useSwipeableItemParams } from "react-native-swipeable-item"
import { ColorThemeType, useTheme, useThemedStyles } from "~Common"
import { BaseIcon, BaseView } from "~Components"
import { Contact } from "~Model"

type Props = {
    onDelete: (address: string) => void
}

export const UnderlayLeft = ({ onDelete }: Props) => {
    const { close, item: contact } = useSwipeableItemParams<Contact>()

    const theme = useTheme()

    const { styles } = useThemedStyles(baseStyles)

    const handleDelete = useCallback(() => {
        onDelete(contact.address)
        close()
    }, [close, contact.address, onDelete])

    return (
        <BaseView style={styles.underlayContainer}>
            <BaseView style={styles.underlayLeft}>
                <TouchableOpacity onPress={handleDelete}>
                    <BaseIcon
                        name={"delete"}
                        size={20}
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
