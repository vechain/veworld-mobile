import React, { memo, useCallback } from "react"
import { FastAction } from "~Model"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"

export const AssetActionsBar = memo(({ actions }: { actions: FastAction[] }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const renderAction = useCallback(
        (action: FastAction) => {
            return (
                <BaseTouchable
                    key={action.name}
                    action={action.action}
                    testID={action.testID}
                    haptics={action.disabled ? "Error" : "Medium"}
                    activeOpacity={action.disabled ? 0.9 : 0.2}
                    style={[styles.action, action.disabled && styles.disabled]}>
                    <BaseView flexDirection="row" justifyContent={"center"} alignItems="center">
                        {action.icon}
                        {!action.iconOnly && (
                            <>
                                <BaseSpacer width={8} />
                                <BaseText
                                    color={
                                        action.disabled
                                            ? theme.colors.primaryDisabled
                                            : theme.colors.actionBanner.buttonTextSecondary
                                    }
                                    typographyFont="captionSemiBold">
                                    {action.name}
                                </BaseText>
                            </>
                        )}
                    </BaseView>
                </BaseTouchable>
            )
        },
        [styles.action, styles.disabled, theme.colors.actionBanner.buttonTextSecondary, theme.colors.primaryDisabled],
    )

    return (
        <BaseView flexDirection="row" style={styles.actionsContainer}>
            {actions.map(renderAction)}
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        action: {
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            borderColor: theme.colors.actionBanner.buttonBorder,
            alignItems: "center",
            height: 40,
            borderWidth: 1,
            flexGrow: 1,
            paddingVertical: 12,
            paddingHorizontal: 4,
            borderRadius: 8,
        },
        actionsContainer: {
            gap: 8,
        },
        disabled: {
            backgroundColor: theme.colors.actionBanner.buttonBackgroundDisabled,
            borderWidth: 0,
        },
    })
