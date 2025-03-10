import React, { memo, useCallback } from "react"
import { FastAction } from "~Model"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"

export const ActionsButtonGroup = memo(({ actions, isVet }: { actions: FastAction[]; isVet?: boolean }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const renderAction = useCallback(
        (action: FastAction) => {
            const actionButtonStyle = [
                styles.common,
                isVet && styles.vetGroup,
                action.iconOnly && styles.onlyIcon,
                action.disabled && styles.disabled,
            ]

            return (
                <BaseTouchable
                    key={action.name}
                    action={action.action}
                    testID={action.testID}
                    haptics={action.disabled ? "Error" : "Medium"}
                    activeOpacity={action.disabled ? 0.9 : 0.2}
                    disabled={action.disabled}
                    style={actionButtonStyle}>
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
        [
            isVet,
            styles.common,
            styles.disabled,
            styles.onlyIcon,
            styles.vetGroup,
            theme.colors.actionBanner.buttonTextSecondary,
            theme.colors.primaryDisabled,
        ],
    )

    return (
        <BaseView flexDirection="row" style={styles.actionsContainer}>
            {actions.map(renderAction)}
        </BaseView>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        common: {
            backgroundColor: theme.colors.actionBanner.buttonBackground,
            borderColor: theme.colors.actionBanner.buttonBorder,
            borderWidth: 1,
            borderRadius: 8,
            paddingVertical: 12,
            flexGrow: 1,
        },
        vetGroup: {
            flex: 1,
        },
        onlyIcon: {
            maxWidth: 42,
            height: 42,
            paddingVertical: 8,
            justifyContent: "center",
        },
        actionsContainer: {
            gap: 8,
            height: 42,
        },
        disabled: {
            backgroundColor: theme.colors.actionBanner.buttonBackgroundDisabled,
            borderWidth: 0,
        },
    })
