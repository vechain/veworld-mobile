import React, { memo, useCallback } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { useThemedStyles } from "~Hooks"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { FastAction } from "~Model"
import { ColorThemeType } from "~Constants"

export const FastActionsBar = memo(
    ({ actions, actionStyle }: { actions: FastAction[]; actionStyle?: StyleProp<ViewStyle> }) => {
        const { styles, theme } = useThemedStyles(baseStyles)

        const renderAction = useCallback(
            (action: FastAction) => {
                return (
                    <BaseTouchable
                        haptics={action.disabled ? "Error" : "Medium"}
                        key={action.name}
                        action={action.action}
                        testID={action.testID}
                        activeOpacity={action.disabled ? 0.9 : 0.2}
                        style={actionStyle ?? styles.action}>
                        <BaseView flexDirection="column" alignItems="center">
                            {action.icon}
                            <BaseSpacer height={8} />
                            <BaseText
                                color={action.disabled ? theme.colors.primaryDisabled : theme.colors.text}
                                typographyFont="captionSemiBold">
                                {action.name}
                            </BaseText>
                        </BaseView>
                    </BaseTouchable>
                )
            },
            [actionStyle, styles.action, theme.colors.primaryDisabled, theme.colors.text],
        )

        return (
            <BaseView flexDirection="row" alignItems="center" style={styles.actionsContainer}>
                {actions.map(renderAction)}
            </BaseView>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        action: {
            flex: 1,
            paddingVertical: 11,
            backgroundColor: theme.colors.card,
            borderRadius: 8,
        },
        actionsContainer: {
            gap: 8,
        },
    })
