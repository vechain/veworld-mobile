import React from "react"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { BaseIcon, BaseTouchable, BaseView } from "~Components/Base"

type Props = { onPress?: () => void; isObservable: boolean }
export const DeleteUnderlay: React.FC<Props> = ({ onPress, isObservable }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.underlayContainer}>
            <BaseTouchable action={onPress} style={styles.underlayLeft}>
                <BaseIcon
                    name="icon-trash"
                    size={24}
                    bg={theme.colors.danger}
                    color={theme.colors.card}
                    style={styles.deleteIcon}
                    testID={isObservable ? "DeleteUnderlay_DeleteIcon_observable" : "DeleteUnderlay_DeleteIcon"}
                />
            </BaseTouchable>
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
