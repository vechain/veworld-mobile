import React, { useCallback, useMemo } from "react"
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
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, isSmallScreen } from "~Constants"
import { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import { FormattingUtils } from "~Utils"

type Props = Omit<BottomSheetModalProps, "snapPoints"> & {
    children: React.ReactNode
    snapPoints?: string[]
    ignoreMinimumSnapPoint?: boolean
    contentStyle?: StyleProp<ViewStyle>
    noMargins?: boolean
    footerStyle?: StyleProp<ViewStyle>
    footer?: React.ReactNode
    onPressOutside?: BackdropPressBehavior
}

/**
 * `BaseBottomSheet` component. This is a wrapper around the `BottomSheetModal`
 * component from `@gorhom/bottom-sheet` library with some additional features.
 *
 * @component
 * @prop {(React.ReactNode)} children - The content of the modal.
 * @prop {(string[]|undefined)} snapPoints - Snap points for the bottom sheet. They should be an array of strings, each representing a percentage.
 * @prop {(boolean|undefined)} ignoreMinimumSnapPoint - If `true`, the minimum snap point is not enforced to 55% of the screen height.
 * @prop {(StyleProp<ViewStyle>|undefined)} contentStyle - Styles for the content view.
 * @prop {(boolean|undefined)} noMargins - If `true`, the content does not have horizontal or vertical margins.
 * @prop {(StyleProp<ViewStyle>|undefined)} footerStyle - Styles for the footer view.
 * @prop {(React.ReactNode|undefined)} footer - The footer of the modal.
 * @prop {(BackdropPressBehavior|undefined)} onPressOutside - Determines the behavior when the backdrop is pressed.
 * @returns {React.ElementType} Returns a `BottomSheetModal` element with the provided props and calculated snap points.
 */
export const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    (
        {
            contentStyle,
            snapPoints,
            ignoreMinimumSnapPoint = false,
            footerStyle,
            noMargins = false,
            footer,
            children,
            onPressOutside = "close",
            ...props
        },
        ref,
    ) => {
        const { styles } = useThemedStyles(baseStyles)

        const renderBackdrop = useCallback(
            (props_: BottomSheetBackdropProps) => {
                return (
                    <BottomSheetBackdrop
                        {...props_}
                        pressBehavior={onPressOutside}
                        opacity={0.5}
                        disappearsOnIndex={-1}
                    />
                )
            },

            [onPressOutside],
        )

        const renderHandle = useCallback(
            (props_: BottomSheetHandleProps) => (
                <BaseView {...props_} style={styles.handleStyle} />
            ),
            [styles],
        )

        /**
         * `snapPoints` should be an array of strings, each representing a percentage.
         *
         * If `snapPoints` is not provided or the values do not represent valid percentages,
         * `snappoints` will default to `["60%"]`.
         *
         * If the screen size is small (`isSmallScreen` is true), the first value in
         * `snapPoints` is less than 60% and we are not ignoring minimum snap point assertion,
         * it will be overwritten to `60%` to ensure that
         * the minimum snap point is at least 60% of the screen height.
         */
        const snappoints = useMemo(() => {
            if (
                !snapPoints ||
                !FormattingUtils.validateStringPercentages(snapPoints)
            )
                return ["60%"]

            if (
                isSmallScreen &&
                !ignoreMinimumSnapPoint &&
                Number(snapPoints[0].slice(0, -1)) < 60
            ) {
                snapPoints[0] = "55%"
            }

            return snapPoints
        }, [ignoreMinimumSnapPoint, snapPoints])

        return (
            <BottomSheetModal
                stackBehavior="push"
                ref={ref}
                enablePanDownToClose={true}
                index={0}
                backgroundStyle={[styles.backgroundStyle]}
                backdropComponent={renderBackdrop}
                handleComponent={renderHandle}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                snapPoints={snappoints}
                {...props}>
                <BaseView
                    w={100}
                    px={noMargins ? 0 : 24}
                    py={noMargins ? 0 : 24}
                    flexGrow={1}
                    alignItems="stretch"
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
