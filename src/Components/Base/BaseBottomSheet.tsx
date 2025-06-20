import { BottomSheetHandleProps, BottomSheetModal, BottomSheetModalProps, BottomSheetView } from "@gorhom/bottom-sheet"
import { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { isFinite } from "lodash"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Platform, StyleProp, StyleSheet, ViewStyle, useWindowDimensions } from "react-native"
import { useReducedMotion } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LocalizedString } from "typesafe-i18n"
import { BaseSpacer, BaseText } from "~Components"
import { COLORS, ColorThemeType, isSmallScreen } from "~Constants"
import { useBackHandler, useThemedStyles } from "~Hooks"
import { BackHandlerEvent } from "~Model"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { BaseView } from "./BaseView"

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
            backHandlerEvent = BackHandlerEvent.DONT_BLOCK,
            bottomSafeArea = true,
            enablePanDownToClose = true,
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

        const [sheetState, setSheetState] = useState<number>(-1)

        const renderHandle = useCallback(
            (props_: BottomSheetHandleProps) => (
                <BaseView style={styles.handleWrapper}>
                    <BaseView {...props_} style={styles.handleStyle} />
                </BaseView>
            ),
            [styles],
        )

        const onSheetPositionChange = useCallback(
            (index: number, position: number, type: any) => {
                setSheetState(index)
                if (onChange) {
                    onChange(index, position, type)
                }
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
            // For dynamic height, don't provide snapPoints - let v5 handle it
            if (dynamicHeight) {
                return undefined
            }

            if (!snapPoints || !validateStringPercentages(snapPoints)) return ["60%"]

            const adjustedSnapPoints = [...snapPoints]
            if (isSmallScreen && !ignoreMinimumSnapPoint && Number(adjustedSnapPoints[0].slice(0, -1)) < 60) {
                adjustedSnapPoints[0] = "55%"
            }

            return adjustedSnapPoints
        }, [dynamicHeight, ignoreMinimumSnapPoint, snapPoints])

        // Calculate max dynamic content size for v5
        const maxDynamicContentSize = useMemo(() => {
            if (!dynamicHeight) return undefined

            // Use 85% of screen height as max, accounting for safe areas
            return Math.floor((windowHeight - bottomSafeAreaSize) * 0.85)
        }, [dynamicHeight, windowHeight, bottomSafeAreaSize])

        // Create content style object
        const contentViewStyle = useMemo(
            () => [
                {
                    paddingHorizontal: noMargins ? 0 : 24,
                    paddingTop: noMargins ? 0 : 16,
                    paddingBottom: noMargins ? 0 : 24,
                    flexGrow: 1,
                    alignItems: "stretch" as const,
                },
                contentStyle,
            ],
            [noMargins, contentStyle],
        )

        return (
            <BottomSheetModal
                animateOnMount={!reducedMotion}
                stackBehavior="push"
                ref={ref}
                enablePanDownToClose={enablePanDownToClose}
                index={0}
                backgroundStyle={[props.backgroundStyle ?? styles.backgroundStyle]}
                // BlurView screws up navigation on Android. Sometimes it renders a blank page, and sometimes the new page is blurry.
                // backdropComponent={blurBackdrop && Platform.OS !== "android" ? renderBlurBackdrop : renderBackdrop} -- Bug lagging (https://github.com/gorhom/react-native-bottom-sheet/issues/2046)
                handleComponent={renderHandle}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                //Workaround for run tests on Maestro take a look at this https://github.com/software-mansion/react-native-reanimated/issues/6648
                accessible={Platform.select({ ios: false })}
                snapPoints={snappoints}
                enableDynamicSizing={dynamicHeight}
                maxDynamicContentSize={maxDynamicContentSize}
                onChange={onSheetPositionChange}
                {...sheetProps}>
                <BottomSheetView style={contentViewStyle}>
                    {title && <BaseText typographyFont="title">{title}</BaseText>}
                    {children}
                    {dynamicHeight && isAndroid() && <BaseSpacer height={16} />}
                </BottomSheetView>
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
            marginTop: 8,
            paddingTop: 8,
            paddingBottom: 16,
            paddingHorizontal: 8,
        },
        handleStyle: {
            width: 70,
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
