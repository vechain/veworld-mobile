import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import DropShadow from "react-native-drop-shadow"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { FastAction } from "~Model"

export const FastActionsBar = memo(({ actions }: { actions: FastAction[] }) => {
    const { styles: themedStyles, theme } = useThemedStyles(baseStyles)

    const renderAction = useCallback((action: FastAction) => {
        return (
            <BaseTouchable
                key={action.name}
                action={action.action}
                testID={action.testID}>
                <BaseView flexDirection="column" alignItems="center">
                    {action.icon}
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="smallButtonPrimary">
                        {action.name}
                    </BaseText>
                </BaseView>
            </BaseTouchable>
        )
    }, [])

    return (
        <DropShadow style={themedStyles.shadowContainer}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                bg={theme.colors.card}
                borderRadius={34}
                px={28}
                py={12}>
                {actions.map(renderAction)}
            </BaseView>
        </DropShadow>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        shadowContainer: {
            ...theme.shadows.card,
            paddingHorizontal: 20,
            justifyContent: "center",
            minWidth: 182,
        },
    })
