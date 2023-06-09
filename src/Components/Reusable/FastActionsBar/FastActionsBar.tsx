import React, { memo, useCallback } from "react"
import { StyleSheet } from "react-native"
import { useTheme } from "~Hooks"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { FastAction } from "~Model"

export const FastActionsBar = memo(({ actions }: { actions: FastAction[] }) => {
    const theme = useTheme()
    const renderAction = useCallback((action: FastAction) => {
        return (
            <BaseTouchable
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
    }, [])

    return (
        <BaseView style={styles.container}>
            <BaseView
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                bg={theme.colors.card}
                borderRadius={34}
                px={24}
                py={12}>
                {actions.map(renderAction)}
            </BaseView>
        </BaseView>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    action: {
        marginHorizontal: 16,
    },
})
