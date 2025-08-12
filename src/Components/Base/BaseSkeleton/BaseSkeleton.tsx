import React, { useMemo } from "react"
import { DimensionValue, StyleProp, ViewStyle } from "react-native"
import Skeleton, { ICustomViewStyle } from "react-native-reanimated-skeleton"
import { BaseView } from "~Components"

type Props = {
    /**
     * The color of the skeleton bone. This is the base color of the loading component.
     */
    boneColor?: string
    /**
     * The highlight color of the skeleton.
     */
    highlightColor?: string
    /**
     *  The style object to apply to the skeleton container.
     */
    containerStyle?: StyleProp<ViewStyle>
    animationDirection?:
        | "horizontalLeft"
        | "horizontalRight"
        | "verticalTop"
        | "verticalDown"
        | "diagonalDownLeft"
        | "diagonalDownRight"
        | "diagonalTopLeft"
        | "diagonalTopRight"
    /**
     * The layout structure for the skeleton. It can be customized to different shapes and sizes.
     */
    layout?: ICustomViewStyle[]
    /**
     * The height of the skeleton line.
     * @default 20
     */
    height?: DimensionValue
    /**
     * The width of the skeleton container.
     */
    width?: DimensionValue
    /**
     * Alignment of items within the skeleton. Default is "center".
     */
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
    testID?: string
    borderRadius?: number
    /**
     * Style of the wrapper container
     */
    rootStyle?: StyleProp<ViewStyle>
}

/**
 * `BaseSkeleton` Component
 *
 * A base skeleton component that provides a loading skeleton placeholder.
 * It can be customized with various styles and layouts.
 *
 * @example
 * <BaseSkeleton
 *     animationDirection="horizontalLeft"
 *     boneColor={
 *         theme.isDark
 *             ? COLORS.LIME_GREEN
 *             : COLORS.DARK_PURPLE
 *     }
 *     highlightColor={COLORS.LIGHT_PURPLE}
 *     height={45}
 *     width={140}
 * />
 *
 */
export const BaseSkeleton = ({
    boneColor,
    highlightColor,
    containerStyle,
    animationDirection,
    layout,
    height = 20,
    width,
    alignItems = "center",
    testID,
    borderRadius = undefined,
    rootStyle,
}: Props) => {
    const computedContainerStyle = useMemo(() => {
        if (containerStyle) {
            return width ? { containerStyle, width } : containerStyle
        }

        return width ? { width } : undefined
    }, [containerStyle, width])

    const renderSkeletonContent: ICustomViewStyle[] = useMemo(() => {
        if (!layout) {
            return [
                {
                    flexDirection: "row",
                    alignItems: alignItems,
                    children: [
                        // Line
                        {
                            width: "100%",
                            height: height,
                            borderRadius: borderRadius,
                        },
                    ],
                },
            ]
        }

        return layout
    }, [alignItems, borderRadius, height, layout])

    return (
        <BaseView testID={testID} style={rootStyle}>
            <Skeleton
                containerStyle={computedContainerStyle}
                animationDirection={animationDirection}
                boneColor={boneColor}
                highlightColor={highlightColor}
                layout={renderSkeletonContent}
                isLoading={true}
            />
        </BaseView>
    )
}
