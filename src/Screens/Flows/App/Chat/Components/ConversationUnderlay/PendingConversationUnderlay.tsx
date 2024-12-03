import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    onAcceptConversation: () => void
    onRejectConversation: () => void
}

export const PendingConversationUnderlay: React.FC<Props> = ({ onAcceptConversation, onRejectConversation }) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    return (
        <BaseView style={styles.underlayContainer} flexDirection="row">
            <BaseTouchable action={onAcceptConversation} style={[styles.underlayItem, styles.acceptUnderlay]}>
                <BaseIcon
                    size={24}
                    color={theme.colors.card}
                    testID="ConversationUnderlay_AcceptIcon"
                    haptics="Light"
                    name={"check-circle-outline"}
                />
            </BaseTouchable>
            <BaseTouchable action={onRejectConversation} style={[styles.underlayItem, styles.rejectUnderlay]}>
                <BaseIcon
                    name={"cancel"}
                    size={24}
                    color={theme.colors.card}
                    testID="ConversationUnderlay_RejectIcon"
                />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        underlayContainer: {
            height: "100%",
            justifyContent: "flex-end",
        },
        acceptUnderlay: {
            backgroundColor: theme.colors.success,
            paddingLeft: 50,
            width: 120,
        },
        rejectUnderlay: {
            width: 70,
            backgroundColor: theme.colors.danger,
        },
        underlayItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
        },
        disabledButton: {
            opacity: 0.5,
        },
    })
