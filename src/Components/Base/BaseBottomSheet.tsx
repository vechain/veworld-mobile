import React, { useCallback } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetModal,
    BottomSheetModalProps,
} from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseView } from "./BaseView"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = BottomSheetModalProps & {
    children: React.ReactNode
    contentStyle?: StyleProp<ViewStyle>
    footerStyle?: StyleProp<ViewStyle>
    footer?: React.ReactNode
}

const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ contentStyle, footerStyle, footer, children, ...props }, ref) => {
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
                stackBehavior="push"
                ref={ref}
                enablePanDownToClose={true}
                index={0}
                backgroundStyle={[styles.backgroundStyle]}
                backdropComponent={renderBackdrop}
                handleComponent={renderHandle}
                {...props}>
                <BaseView
                    w={100}
                    px={24}
                    py={24}
                    alignItems="flex-start"
                    style={contentStyle}>
                    {children}
                </BaseView>
                {footer && (
                    <BaseView
                        w={100}
                        px={24}
                        alignItems="center"
                        justifyContent="center"
                        style={footerStyle}>
                        {footer}
                    </BaseView>
                )}
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
