import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetModal,
    BottomSheetModalProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet"
import { BackdropPressBehavior } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { isFinite } from "lodash"
import { PropsWithChildren, default as React, ReactNode, useCallback, useMemo } from "react"
import { Platform, StyleProp, StyleSheet, ViewStyle, useWindowDimensions } from "react-native"
import { useReducedMotion } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LocalizedString } from "typesafe-i18n"
import { BaseSpacer, BaseText, BlurBackdropBottomSheet } from "~Components"
import { COLORS, ColorThemeType, isSmallScreen } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useBottomSheetBackHandler } from "~Hooks/useBottomSheetBackHandler"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"
import { typedForwardRef } from "~Utils/ReactUtils"
import { BaseView } from "./BaseView"

export type BaseBottomSheetProps<TData = unknown> = Omit<
    BottomSheetModalProps,
    "snapPoints" | "children" | "enablePanDownToClose"
> & {
    /**
     * The content of the modal.
     */
    children: React.ReactNode | ((props: TData) => React.ReactNode)
    /**
     * The title of the modal.
     */
    title?: LocalizedString
    /**
     * Optional left element in the header (e.g., close button, icon).
     */
    leftElement?: ReactNode
    /**
     * Optional right element in the header (e.g., action button, icon).
     */
    rightElement?: ReactNode
    /**
     * Snap points for the bottom sheet. They should be an array of strings, each representing a percentage.
     */
    snapPoints?: string[]
    /**
     * If true, the height of the bottom sheet will be determined by the content and snapPoints are ignored.
     */
    dynamicHeight?: boolean
    /**
     * If `true`, the minimum snap point is not enforced to 55% of the screen height.
     */
    ignoreMinimumSnapPoint?: boolean
    /**
     * Styles for the content view.
     */
    contentStyle?: StyleProp<ViewStyle>
    /**
     * If `true`, the content does not have horizontal or vertical margins.
     */
    noMargins?: boolean
    /**
     * Styles for the footer view.
     */
    footerStyle?: StyleProp<ViewStyle>
    /**
     * The footer of the modal.
     */
    footer?: React.ReactNode
    /**
     * Determines the behavior when the backdrop is pressed.
     */
    onPressOutside?: BackdropPressBehavior
    /**
     * If `true`, there's a bottom safe area.
     */
    bottomSafeArea?: boolean
    /**
     * Enable pan down to close
     * @default true
     */
    enablePanDownToClose?: boolean
    /**
     * Enable blur backdrop on iOS
     */
    blurBackdrop?: boolean
    /**
     * Enable floating behavior - detach from the bottom of the screen
     */
    floating?: boolean
    /**
     * Enable back to close. If set to true when clicking the back button on Android it'll close the BS.
     * @default true
     */
    enableBackToClose?: boolean
    /**
     * Make the bottom sheet top rounded. Only valid when `floating` is false.
     * @default true
     */
    rounded?: boolean
}

const BaseBottomSheetContent = ({
    bottomSafeArea,
    bottomSafeAreaSize,
    contentViewStyle,
    dynamicHeight,
    footer,
    footerStyle,
    snapPoints,
    title,
    leftElement,
    rightElement,
    children,
    floating,
}: PropsWithChildren<{
    bottomSafeArea: boolean
    bottomSafeAreaSize: number
    contentViewStyle: StyleProp<ViewStyle>[] | StyleProp<ViewStyle>
    dynamicHeight: boolean
    footer: ReactNode
    footerStyle: StyleProp<ViewStyle>[] | StyleProp<ViewStyle>
    snapPoints?: string[]
    title?: string
    leftElement?: ReactNode
    rightElement?: ReactNode
    floating: boolean
}>) => {
    const headerStyles = useMemo(
        () => ({
            headerContainer: { marginBottom: 16 },
            leftElement: { marginRight: 16 },
            rightElement: { marginLeft: 16 },
        }),
        [],
    )

    const renderHeader = () => {
        const hasHeader = title || leftElement || rightElement
        if (!hasHeader) return null

        return (
            <BaseView flexDirection="row" alignItems="center" style={headerStyles.headerContainer}>
                {leftElement && <BaseView style={headerStyles.leftElement}>{leftElement}</BaseView>}
                {title && (
                    <BaseView flex={1}>
                        <BaseText typographyFont="biggerTitleSemiBold">{title}</BaseText>
                    </BaseView>
                )}
                {rightElement && <BaseView style={headerStyles.rightElement}>{rightElement}</BaseView>}
            </BaseView>
        )
    }

    return (
        <>
            {snapPoints ? (
                <BaseView style={contentViewStyle}>
                    {renderHeader()}
                    {children}
                    {dynamicHeight && isAndroid() && <BaseSpacer height={16} />}
                </BaseView>
            ) : (
                <BottomSheetView style={contentViewStyle}>
                    {renderHeader()}
                    {children}
                    {dynamicHeight && isAndroid() && !floating && <BaseSpacer height={16} />}
                </BottomSheetView>
            )}
            {footer && (
                <BaseView w={100} px={24} alignItems="center" justifyContent="center" style={footerStyle}>
                    {footer}
                </BaseView>
            )}
            {bottomSafeArea && <BaseSpacer height={bottomSafeAreaSize} />}
        </>
    )
}

const _BaseBottomSheet = <TData,>(
    {
        contentStyle,
        snapPoints,
        dynamicHeight = false,
        title,
        leftElement,
        rightElement,
        ignoreMinimumSnapPoint = false,
        footerStyle,
        noMargins = false,
        footer,
        children,
        onPressOutside = "close",
        enableBackToClose = true,
        bottomSafeArea = true,
        enablePanDownToClose = true,
        blurBackdrop = false,
        backgroundStyle,
        stackBehavior = "push",
        floating = false,
        rounded = true,
        ...props
    }: BaseBottomSheetProps<TData>,
    ref: React.ForwardedRef<BottomSheetModalMethods>,
) => {
    const { onChange, ...sheetProps } = props
    const { styles } = useThemedStyles(baseStyles)
    const { height: windowHeight } = useWindowDimensions()
    const { bottom: bottomSafeAreaSize } = useSafeAreaInsets()
    const reducedMotion = useReducedMotion()
    const { handleSheetPositionChange } = useBottomSheetBackHandler(ref)

    const renderBlurBackdrop = useCallback((props_: BottomSheetBackdropProps) => {
        return <BlurBackdropBottomSheet animatedIndex={props_.animatedIndex} />
    }, [])

    const renderBackdrop = useCallback(
        (props_: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props_}
                pressBehavior={onPressOutside}
                opacity={0.85}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ),
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
            if (enableBackToClose) handleSheetPositionChange(index)
            onChange?.(index)
        },
        [enableBackToClose, handleSheetPositionChange, onChange],
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
        // For dynamic height, don't provide snapPoints - let v4 handle it
        if (dynamicHeight) {
            return undefined
        }

        if (!snapPoints || !validateStringPercentages(snapPoints)) return ["60%"]

        if (isSmallScreen && !ignoreMinimumSnapPoint && Number(snapPoints[0].slice(0, -1)) < 60) {
            snapPoints[0] = "55%"
        }

        return snapPoints
    }, [dynamicHeight, ignoreMinimumSnapPoint, snapPoints])

    // Calculate max dynamic content size for v5
    const maxDynamicContentSize = useMemo(() => {
        if (!dynamicHeight) return undefined

        // Use 85% of screen height as max, accounting for safe areas
        return Math.floor((windowHeight - bottomSafeAreaSize) * 0.85)
    }, [dynamicHeight, windowHeight, bottomSafeAreaSize])

    const floatingBottomInset = useMemo(() => {
        if (!floating) return undefined
        if (isAndroid()) return bottomSafeAreaSize + 32
        return bottomSafeAreaSize
    }, [floating, bottomSafeAreaSize])

    // Create content style object
    const contentViewStyle = useMemo(
        () => [
            {
                paddingHorizontal: noMargins ? 0 : 24,
                paddingTop: noMargins ? 0 : 16,
                paddingBottom: noMargins ? 0 : 24,
                flexGrow: snapPoints ? 1 : undefined,
                alignItems: "stretch" as const,
            },
            contentStyle,
        ],
        [noMargins, snapPoints, contentStyle],
    )

    const rootStyle = useMemo(() => {
        if (floating) return [styles.floating, styles.floatingRounding]
        if (rounded) return [styles.notFloatingRounding]
        return undefined
    }, [floating, rounded, styles.floating, styles.floatingRounding, styles.notFloatingRounding])

    const bgRoundingStyle = useMemo(() => {
        if (floating) return [styles.floatingRounding]
        if (rounded) return [styles.notFloatingRounding]
        return [styles.noRounding]
    }, [floating, rounded, styles.floatingRounding, styles.noRounding, styles.notFloatingRounding])

    return (
        <BottomSheetModal
            animateOnMount={!reducedMotion}
            stackBehavior={stackBehavior}
            ref={ref}
            enablePanDownToClose={enablePanDownToClose}
            index={0}
            style={rootStyle}
            bottomInset={floating ? floatingBottomInset : undefined}
            backgroundStyle={[bgRoundingStyle, backgroundStyle ?? styles.backgroundStyle]}
            // BlurView screws up navigation on Android. Sometimes it renders a blank page, and sometimes the new page is blurry. Bug lagging (https://github.com/gorhom/react-native-bottom-sheet/issues/2046)
            backdropComponent={blurBackdrop && Platform.OS !== "android" ? renderBlurBackdrop : renderBackdrop}
            handleComponent={enablePanDownToClose ? renderHandle : null}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            //Workaround for run tests on Maestro take a look at this https://github.com/software-mansion/react-native-reanimated/issues/6648
            accessible={Platform.select({ ios: false })}
            snapPoints={snappoints}
            onChange={onSheetPositionChange}
            maxDynamicContentSize={maxDynamicContentSize}
            enableDynamicSizing={dynamicHeight}
            detached={floating}
            {...sheetProps}>
            {typeof children === "function" ? (
                p => (
                    <BaseBottomSheetContent
                        bottomSafeArea={bottomSafeArea}
                        bottomSafeAreaSize={bottomSafeAreaSize}
                        contentViewStyle={contentViewStyle}
                        dynamicHeight={dynamicHeight}
                        footer={footer}
                        footerStyle={footerStyle}
                        snapPoints={snapPoints}
                        title={title}
                        leftElement={leftElement}
                        rightElement={rightElement}
                        floating={floating}>
                        {children(p?.data)}
                    </BaseBottomSheetContent>
                )
            ) : (
                <BaseBottomSheetContent
                    bottomSafeArea={bottomSafeArea}
                    bottomSafeAreaSize={bottomSafeAreaSize}
                    contentViewStyle={contentViewStyle}
                    dynamicHeight={dynamicHeight}
                    footer={footer}
                    footerStyle={footerStyle}
                    snapPoints={snapPoints}
                    title={title}
                    leftElement={leftElement}
                    rightElement={rightElement}
                    floating={floating}>
                    {children}
                </BaseBottomSheetContent>
            )}
        </BottomSheetModal>
    )
}

/**
 * `BaseBottomSheet` component. This is a wrapper around the `BottomSheetModal`
 * component from `@gorhom/bottom-sheet` library with some additional features.
 */
export const BaseBottomSheet = typedForwardRef(_BaseBottomSheet)

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backgroundStyle: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : COLORS.GREY_50,
        },
        blurBackdrop: {
            backgroundColor: COLORS.PURPLE_BLUR_TRANSPARENT,
            top: 0,
            left: 0,
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.5,
        },
        floating: {
            marginHorizontal: 8,
            overflow: "hidden",
        },
        floatingRounding: {
            borderRadius: 24,
        },
        notFloatingRounding: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        noRounding: {
            borderRadius: 0,
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
            backgroundColor: COLORS.GREY_300,
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
