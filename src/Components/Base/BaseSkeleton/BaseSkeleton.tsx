import React, { useMemo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import SkeletonContent from "react-native-skeleton-content-nonexpo"
import { ICustomViewStyle } from "react-native-skeleton-content-nonexpo/lib/Constants"
import { BaseView } from "~Components"

type Props = {
    boneColor: string
    highlightColor: string
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
    layout?: ICustomViewStyle[]
    height?: number
    width?: number
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline"
    testID?: string
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
 * @param {string} boneColor - The color of the skeleton bone. This is the base color of the loading component.
 * @param {string} highlightColor - The highlight color of the skeleton.
 * @param {StyleProp<ViewStyle>} [containerStyle] - The style object to apply to the skeleton container.
 * @param {"horizontalLeft" | "horizontalRight" | "verticalTop" | "verticalDown" | "diagonalDownLeft" | "diagonalDownRight" | "diagonalTopLeft" | "diagonalTopRight"} [animationDirection] - The animation direction of the skeleton.
 * @param {ICustomViewStyle[]} [layout] - The layout structure for the skeleton. It can be customized to different shapes and sizes.
 * @param {number} [height=20] - The height of the skeleton line. Default is 20.
 * @param {number} [width] - The width of the skeleton container.
 * @param {"flex-start" | "flex-end" | "center" | "stretch" | "baseline"} [alignItems="center"] - Alignment of items within the skeleton. Default is "center".
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
                        },
                    ],
                },
            ]
        }

        return layout
    }, [alignItems, height, layout])

    return (
        <BaseView testID={testID}>
            <SkeletonContent
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
