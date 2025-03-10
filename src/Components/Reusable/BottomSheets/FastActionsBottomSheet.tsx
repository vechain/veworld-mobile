import React, { useCallback, useMemo } from "react"
import { FastAction } from "~Model"
import { StyleSheet } from "react-native"
import { useScrollableBottomSheet, useThemedStyles } from "~Hooks"
import { BaseBottomSheet, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"

import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"

type Props = {
    onDismiss?: () => void
    closeBottomSheet?: () => void
    actions: FastAction[]
}

const ItemSeparatorComponent = () => <BaseSpacer height={14} />

export const FastActionsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, onDismiss, actions }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)
        const iconColor = theme.colors.actionBottomSheet

        const handlePress = useCallback(
            (action: FastAction) => {
                if (closeBottomSheet) {
                    closeBottomSheet()
                    action.action()
                }
            },
            [closeBottomSheet],
        )

        const computeSnappoints = useMemo(() => {
            if (actions.length < 5) {
                return ["45%"]
            }
            if (actions.length < 6) {
                return ["55%"]
            }

            if (actions.length > 6) {
                return ["75%"]
            }

            return ["45%", "55%", "75%"]
        }, [actions.length])

        const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
            data: actions,
            snapPoints: computeSnappoints,
        })

        const renderAction = useCallback(
            (action: FastAction) => {
                return (
                    <BaseTouchable
                        key={action.name}
                        action={() => handlePress(action)}
                        testID={action.testID}
                        haptics={action.disabled ? "Error" : "Medium"}
                        activeOpacity={action.disabled ? 0.9 : 0.2}
                        disabled={action.disabled}
                        style={[styles.action]}>
                        <BaseView flexDirection="row" justifyContent={"center"} alignItems="center">
                            <BaseView
                                bg={action.disabled ? iconColor.disabledIconBackground : iconColor.iconBackground}
                                style={styles.actionIconBottomSheet}>
                                {action.icon}
                            </BaseView>
                            {!action.iconOnly && (
                                <>
                                    <BaseSpacer width={24} />
                                    <BaseText
                                        color={action.disabled ? iconColor.disabledText : iconColor.text}
                                        typographyFont="subSubTitleSemiBold">
                                        {action.name}
                                    </BaseText>
                                </>
                            )}
                        </BaseView>
                    </BaseTouchable>
                )
            },
            [
                handlePress,
                iconColor.disabledIconBackground,
                iconColor.disabledText,
                iconColor.iconBackground,
                iconColor.text,
                styles.action,
                styles.actionIconBottomSheet,
            ],
        )

        return (
            <BaseBottomSheet
                ref={ref}
                snapPoints={computeSnappoints}
                backgroundStyle={styles.layout}
                onChange={handleSheetChangePosition}
                blurBackdrop
                onDismiss={onDismiss}>
                <BottomSheetFlatList
                    data={actions}
                    keyExtractor={action => action.name}
                    ItemSeparatorComponent={ItemSeparatorComponent}
                    renderItem={({ item }) => renderAction(item)}
                    {...flatListScrollProps}
                />
            </BaseBottomSheet>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        action: {
            flexDirection: "row",
            flexGrow: 1,
            paddingVertical: 8,
            borderRadius: 8,
        },
        actionIconBottomSheet: {
            width: 38,
            height: 38,
            borderRadius: 38,
            justifyContent: "center",
            alignItems: "center",
        },
    })
