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
                    style={[
                        styles.common,
                        action.iconOnly ? styles.onlyIcon : styles.withText,
                        action.disabled && styles.disabled,
                    ]}>
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
            styles.common,
            styles.disabled,
            styles.onlyIcon,
            styles.withText,
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
            borderRadius: 8,
            paddingVertical: 12,
        },
        withText: {
            borderWidth: 1,
            flex: 1,
            flexGrow: 1,
            paddingVertical: 12,
        },
        onlyIcon: {
            width: 40,
            height: 40,
            paddingVertical: 8,
            borderWidth: 1,
            justifyContent: "center",
        },
        actionsContainer: {
            gap: 8,
            height: 40,
        },
        disabled: {
            backgroundColor: theme.colors.actionBanner.buttonBackgroundDisabled,
            borderWidth: 0,
        },
    })
