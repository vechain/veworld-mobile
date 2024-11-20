import React, { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleProp, StyleSheet, ViewStyle, useWindowDimensions } from "react-native"
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetModal,
    BottomSheetModalProps,
} from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseView } from "./BaseView"
import { useBackHandler, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, isSmallScreen } from "~Constants"
import { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import { BaseSpacer, BaseText, BlurView } from "~Components"
import { LocalizedString } from "typesafe-i18n"
import { useReducedMotion } from "react-native-reanimated"
import { isFinite } from "lodash"
import { BackHandlerEvent } from "~Model"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const OPENED_STATE = 0
const CLOSED_STATE = -1

type Props = Omit<BottomSheetModalProps, "snapPoints"> & {
    children: React.ReactNode
    title?: LocalizedString
    snapPoints?: string[]
    dynamicHeight?: boolean
    ignoreMinimumSnapPoint?: boolean
    contentStyle?: StyleProp<ViewStyle>
    noMargins?: boolean
    footerStyle?: StyleProp<ViewStyle>
    footer?: React.ReactNode
    onPressOutside?: BackdropPressBehavior
    backHandlerEvent?: BackHandlerEvent
    bottomSafeArea?: boolean
    enablePanDownToClose?: boolean
    blurBackdrop?: boolean
}

/**
 * `BaseBottomSheet` component. This is a wrapper around the `BottomSheetModal`
 * component from `@gorhom/bottom-sheet` library with some additional features.
 *
 * @component
 * @prop {(React.ReactNode)} children - The content of the modal.
 * @prop {(LocalizedString|undefined)} title - The title of the modal.
 * @prop {(string[]|undefined)} snapPoints - Snap points for the bottom sheet. They should be an array of strings, each representing a percentage.
 * @prop {(boolean)} dynamicHeight - If true, the height of the bottom sheet will be determined by the content and snapPoints are ignored.
 * @prop {(boolean|undefined)} ignoreMinimumSnapPoint - If `true`, the minimum snap point is not enforced to 55% of the screen height.
 * @prop {(StyleProp<ViewStyle>|undefined)} contentStyle - Styles for the content view.
 * @prop {(boolean|undefined)} noMargins - If `true`, the content does not have horizontal or vertical margins.
 * @prop {(StyleProp<ViewStyle>|undefined)} footerStyle - Styles for the footer view.
 * @prop {(React.ReactNode|undefined)} footer - The footer of the modal.
 * @prop {(BackdropPressBehavior|undefined)} onPressOutside - Determines the behavior when the backdrop is pressed.
 * @prop {(BackHandlerEvent|undefined)} backHandlerEvent - Determines the behavior when the Android hardware back button is pressed. Use `BackHandlerEvent.BLOCK` to prevent the back button from closing the modal.
 * @returns {React.ElementType} Returns a `BottomSheetModal` element with the provided props and calculated snap points.
 */
export const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    (
        {
            contentStyle,
            snapPoints,
            dynamicHeight = false,
            title,
            ignoreMinimumSnapPoint = false,
            footerStyle,
            noMargins = false,
            footer,
            children,
            onPressOutside = "close",
            backHandlerEvent = BackHandlerEvent.DONT_BLOCK,
            bottomSafeArea = true,
            enablePanDownToClose = true,
            blurBackdrop = false,
            ...props
        },
        ref,
    ) => {
        const { onChange, ...sheetProps } = props
        const { styles } = useThemedStyles(baseStyles)
        const { height: windowHeight } = useWindowDimensions()
        const { bottom: bottomSafeAreaSize } = useSafeAreaInsets()
        const reducedMotion = useReducedMotion()
        const { addBackHandlerListener, removeBackHandlerListener } = useBackHandler(backHandlerEvent)

        const [contentHeight, setContentHeight] = useState<number>(0)
        const [sheetState, setSheetState] = useState<number>(-1)

        const onLayoutHandler = useCallback(
            (event: LayoutChangeEvent) => {
                if (dynamicHeight) {
                    const { height } = event.nativeEvent.layout
                    setContentHeight(prev => (prev !== height ? height : prev))
                }
            },
            [dynamicHeight],
        )

        const renderBlurBackdrop = useCallback(() => {
            return (
                <BlurView
                    style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.PURPLE_BLUR_TRANSPARENT }]}
                    blurAmount={4}
                    blurType={"dark"}
                />
            )
        }, [])

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
                <BaseView style={styles.handleWrapper}>
                    <BaseView {...props_} style={styles.handleStyle} />
                </BaseView>
            ),
            [styles],
        )

        const onSheetPositionChange = useCallback(
            (index: number) => {
                setSheetState(index)
                onChange && onChange(index)
            },
            [onChange],
        )

        useEffect(() => {
            if (sheetState === OPENED_STATE) {
                addBackHandlerListener()
            }

            if (sheetState === CLOSED_STATE) {
                removeBackHandlerListener()
            }
        }, [addBackHandlerListener, removeBackHandlerListener, sheetState])

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
            if (dynamicHeight) {
                const percentage = Math.ceil(((contentHeight + bottomSafeAreaSize) / windowHeight) * 100)
                return contentHeight ? [`${percentage}%`] : ["25%"]
            }

            if (!snapPoints || !validateStringPercentages(snapPoints)) return ["60%"]

            if (isSmallScreen && !ignoreMinimumSnapPoint && Number(snapPoints[0].slice(0, -1)) < 60) {
                snapPoints[0] = "55%"
            }

            return snapPoints
        }, [bottomSafeAreaSize, contentHeight, dynamicHeight, ignoreMinimumSnapPoint, snapPoints, windowHeight])

        return (
            <BottomSheetModal
                animateOnMount={!reducedMotion}
                stackBehavior="push"
                ref={ref}
                enablePanDownToClose={enablePanDownToClose}
                index={0}
                backgroundStyle={[styles.backgroundStyle]}
                backdropComponent={blurBackdrop ? renderBlurBackdrop : renderBackdrop}
                handleComponent={renderHandle}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                snapPoints={snappoints}
                onChange={onSheetPositionChange}
                {...sheetProps}>
                <BaseView
                    w={100}
                    px={noMargins ? 0 : 24}
                    py={noMargins ? 0 : 24}
                    flexGrow={1}
                    alignItems="stretch"
                    style={contentStyle}
                    onLayout={onLayoutHandler}>
                    {title && <BaseText typographyFont="title">{title}</BaseText>}
                    {children}
                    {dynamicHeight && isAndroid() && <BaseSpacer height={16} />}
                </BaseView>
                {footer && (
                    <BaseView w={100} px={24} alignItems="center" justifyContent="center" style={footerStyle}>
                        {footer}
                    </BaseView>
                )}
                {bottomSafeArea && <BaseSpacer height={bottomSafeAreaSize} />}
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
        blurBackdrop: {
            backgroundColor: COLORS.PURPLE_BLUR_TRANSPARENT,
            top: 0,
            left: 0,
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.5,
        },
        handleWrapper: {
            marginTop: 4,
            paddingTop: 4,
            paddingBottom: 16,
            paddingHorizontal: 8,
        },
        handleStyle: {
            width: 60,
            height: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.text,
            alignSelf: "center",
        },
    })

export const validateStringPercentages = (percentages: string[]): boolean => {
    // Check if percentages is a non-empty array
    if (percentages.length === 0) return false

    for (const percentage of percentages) {
        // Check if string ends with '%'
        if (!percentage.endsWith("%")) {
            return false
        }

        // Check if the prefix is a valid number between 0 and 100
        let value = Number(percentage.slice(0, -1))
        if (!isFinite(value) || value < 0 || value > 100) {
            return false
        }
    }

    // If we made it this far, all strings are valid percentages
    return true
}
