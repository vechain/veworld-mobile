import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetModal,
    BottomSheetProps,
} from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseView } from "./BaseView"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = BottomSheetProps & {
    children: React.ReactNode
}

const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ children, ...props }, ref) => {
        const { styles } = useThemedStyles(baseStyles)

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

        const renderHandle = useCallback(
            (props_: BottomSheetHandleProps) => (
                <BaseView {...props_} style={styles.handleStyle} />
            ),
            [styles],
        )

        return (
            <BottomSheetModal
                ref={ref}
                enablePanDownToClose={true}
                index={0}
                backgroundStyle={[styles.backgroundStyle]}
                backdropComponent={renderBackdrop}
                handleComponent={renderHandle}
                {...props}>
                <BaseView w={100} px={24} py={32} align="flex-start">
                    {children}
                </BaseView>
            </BottomSheetModal>
        )
    },
)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        handleStyle: {
            width: 60,
            height: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.text,
            alignSelf: "center",
            marginTop: 24,
        },
    })

export default BaseBottomSheet
