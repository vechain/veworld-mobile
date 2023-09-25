import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { useTheme, useThemedStyles } from "~Hooks"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { FastAction } from "~Model"

export const FastActionsBar = memo(
    ({
        actions,
        actionItemWidth = 70,
    }: {
        actions: FastAction[]
        actionItemWidth?: number
    }) => {
        const theme = useTheme()

        const { styles } = useThemedStyles(baseStyles(actionItemWidth))

        const renderAction = useCallback(
            (action: FastAction) => {
                return (
                    <BaseTouchable
                        haptics="Medium"
                        key={action.name}
                        action={action.action}
                        testID={action.testID}
                        style={styles.action}>
                        <BaseView flexDirection="column" alignItems="center">
                            {action.icon}
                            <BaseSpacer height={6} />
                            <BaseText typographyFont="smallButtonPrimary">
                                {action.name}
                            </BaseText>
                        </BaseView>
                    </BaseTouchable>
                )
            },
            [styles.action],
        )

        return (
            <BaseView style={styles.container}>
                <BaseView
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    bg={theme.colors.card}
                    borderRadius={34}
                    style={styles.actionsContainer}>
                    {actions.map(renderAction)}
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (actionItemWidth: number) => () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 20,
            justifyContent: "center",
            alignItems: "center",
        },
        action: {
            paddingVertical: 12,
            width: actionItemWidth,
        },
        actionsContainer: {
            paddingHorizontal: 10,
        },
    })
