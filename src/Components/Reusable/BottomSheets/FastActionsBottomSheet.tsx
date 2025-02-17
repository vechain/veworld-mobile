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

const ItemSeparatorComponent = () => <BaseSpacer height={16} />

// component to select an account
export const FastActionsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, onDismiss, actions }, ref) => {
        const { styles, theme } = useThemedStyles(baseStyles)

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
            if (actions.length < 4) {
                return ["40%"]
            }

            if (actions.length > 7) {
                return ["90%"]
            }

            if (actions.length > 4) {
                return ["75%", "90%"]
            }

            return ["40%", "75%", "90%"]
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
                        style={[styles.action, action.disabled && styles.disabled]}>
                        <BaseView flexDirection="row" justifyContent={"center"} alignItems="center">
                            <BaseView style={styles.actionIconBottomSheet}>{action.icon}</BaseView>
                            {!action.iconOnly && (
                                <>
                                    <BaseSpacer width={24} />
                                    <BaseText
                                        color={
                                            action.disabled
                                                ? theme.colors.actionBottomSheet.disabledText
                                                : theme.colors.actionBottomSheet.text
                                        }
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
                styles.action,
                styles.actionIconBottomSheet,
                styles.disabled,
                theme.colors.actionBottomSheet.disabledText,
                theme.colors.actionBottomSheet.text,
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
                <BaseSpacer height={6} />
            </BaseBottomSheet>
        )
    },
)

// export const FastActionsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
//     ({ closeBottomSheet, onDismiss, actions }, ref) => {
//         const { styles, theme } = useThemedStyles(baseStyles)
//
//         const handlePress = useCallback(() => {
//             if (closeBottomSheet) closeBottomSheet()
//         }, [closeBottomSheet])
//
//         const computeSnappoints = useMemo(() => {
//             if (actions.length < 6) {
//                 return ["50%"]
//             }
//
//             if (actions.length > 7) {
//                 return ["90%"]
//             }
//
//             if (actions.length > 6) {
//                 return ["75%", "90%"]
//             }
//
//             return ["50%", "75%", "90%"]
//         }, [actions.length])
//
//         const { flatListScrollProps, handleSheetChangePosition } = useScrollableBottomSheet({
//             data: actions,
//             snapPoints: computeSnappoints,
//         })
//

//
//         return (
//             <BaseBottomSheet
//                 ref={ref}
//                 backgroundStyle={styles.layout}
//                 onChange={handleSheetChangePosition}
//                 blurBackdrop
//                 enablePanDownToClose
//                 onDismiss={onDismiss}>
//                 {/*<BaseView flexDirection="column" style={styles.actionsContainer}>*/}
//                 {/*    {actions.map(renderAction)}*/}
//                 {/*</BaseView>*/}
//                 <BottomSheetFlatList
//                     data={actions}
//                     keyExtractor={action => action.name}
//                     ItemSeparatorComponent={ItemSeparatorComponent}
//                     renderItem={({ item }) => renderAction(item)}
//                     {...flatListScrollProps}
//                 />
//             </BaseBottomSheet>
//         )
//     },
// )
//
const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        layout: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
        },
        action: {
            flexDirection: "row",
            height: 48,
            flexGrow: 1,
            paddingVertical: 6,
            borderRadius: 8,
        },
        disabled: {},
        actionIconBottomSheet: {
            backgroundColor: theme.colors.actionBottomSheet.iconBackground,
            width: 34,
            height: 34,
            borderRadius: 34,
            justifyContent: "center",
            alignItems: "center",
        },
    })
