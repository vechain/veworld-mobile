import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetProps,
} from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseView } from "./BaseView"
import { useThemedStyles, useThemeType } from "~Common"

type Props = BottomSheetProps & {
    children: React.ReactNode
}

const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ children, ...props }, ref) => {
        const themedStyles = useThemedStyles(styles)

        const renderBackdrop = useCallback(
            (props_: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props_}
                    pressBehavior="close"
                    opacity={0.5}
                    disappearsOnIndex={-1}
                />
            ),
            [],
        )

        return (
            <BottomSheetModal
                ref={ref}
                enablePanDownToClose={true}
                index={0}
                backgroundStyle={[themedStyles.backgroundStyle]}
                backdropComponent={renderBackdrop}
                {...props}>
                <BaseView w={100} p={24} align="flex-start">
                    {children}
                </BaseView>
            </BottomSheetModal>
        )
    },
)

const styles = (theme: useThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
    })

export default BaseBottomSheet
