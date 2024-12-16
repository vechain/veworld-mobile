import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onPress: () => void
}

export const DeletedConversationUnderlay: React.FC<Props> = ({ onPress }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.underlayContainer}>
            <BaseTouchable action={onPress} style={[styles.underlayLeft]}>
                <BaseIcon
                    name="icon-undo"
                    size={24}
                    bg={theme.colors.primaryLight}
                    color={theme.colors.card}
                    style={styles.restoreIcon}
                    testID={"ConversationUnderlay_RestoreIcon"}
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
            height: "100%",
            backgroundColor: theme.colors.primaryLight,
        },
        restoreIcon: { marginRight: 10 },
    })
