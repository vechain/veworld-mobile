import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Common"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { FastAction } from "~Model"

export const FastActionsBar = memo(({ actions }: { actions: FastAction[] }) => {
    const theme = useTheme()
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
        <BaseView style={baseStyles.shadowContainer}>
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
        </BaseView>
    )
})

const baseStyles = StyleSheet.create({
    shadowContainer: {
        paddingHorizontal: 20,
        justifyContent: "center",
        minWidth: 273,
    },
})
