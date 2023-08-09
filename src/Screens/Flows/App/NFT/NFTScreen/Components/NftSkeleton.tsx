import React, { useMemo } from "react"
import { useThemedStyles } from "~Hooks"
import { SCREEN_WIDTH } from "~Constants"
import { StyleSheet } from "react-native"
import { BaseSkeleton } from "~Components"

export const NftSkeleton = ({
    numberOfChildren,
    showMargin = false,
    isNFT = false,
    renderExtra = false,
}: {
    numberOfChildren: number
    showMargin?: boolean
    isNFT?: boolean
    renderExtra?: boolean
}) => {
    const { styles, theme } = useThemedStyles(baseStyles(renderExtra))

    const renderChildren = useMemo(() => {
        const children = []

        const _numberOfChildren = renderExtra
            ? numberOfChildren + 2
            : numberOfChildren

        for (let i = 0; i < _numberOfChildren; i++) {
            const isLast = i === _numberOfChildren - 1
            const isSecondToLast = i === _numberOfChildren - 2

            const isHideBottomMargin = isLast || isSecondToLast

            children.push({
                width: SCREEN_WIDTH / 2 - 30,
                height: 164,
                borderRadius: 16,
                // 1px is a hack to make the list trigger an api call without the need of rescrolling if after the last api call you're already at the bottomReachedThreshold
                marginBottom: isHideBottomMargin ? 1 : 16,
            })
        }

        return children
    }, [numberOfChildren, renderExtra])

    const renderNFTHeader = useMemo(() => {
        if (isNFT) {
            return [
                {
                    opacity: 0.2,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginHorizontal: 20,
                    children: [
                        {
                            width: 80,
                            height: 80,
                            borderRadius: 12,
                            marginRight: 14,
                            marginTop: 12,
                        },

                        {
                            children: [
                                {
                                    width: SCREEN_WIDTH / 1.7,
                                    height: 18,
                                    marginBottom: 4,
                                },

                                {
                                    width: SCREEN_WIDTH / 2.2,
                                    height: 18,
                                    marginBottom: 4,
                                },
                                {
                                    width: SCREEN_WIDTH / 3,
                                    height: 32,
                                },
                            ],
                        },
                    ],
                },

                {
                    marginHorizontal: 20,
                    children: [
                        {
                            opacity: 0.2,
                            width: 128,
                            height: 12,
                            marginTop: 22,
                        },

                        {
                            opacity: 0.2,
                            width: SCREEN_WIDTH - 48,
                            height: 12,
                            marginTop: 22,
                        },

                        {
                            opacity: 0.2,
                            width: SCREEN_WIDTH - 48,
                            height: 12,
                            marginTop: 8,
                        },

                        {
                            opacity: 0.2,
                            width: 128,
                            height: 22,
                            marginTop: 24,
                            marginBottom: 16,
                        },
                    ],
                },
            ]
        } else {
            return [
                {
                    marginTop: showMargin ? 22 : 16,
                    width: SCREEN_WIDTH,
                    justifyContent: "center",
                    alignItems: "center",
                },
            ]
        }
    }, [isNFT, showMargin])

    return (
        <BaseSkeleton
            containerStyle={styles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            // @ts-ignore
            layout={[
                ...renderNFTHeader,

                {
                    opacity: 0.1,
                    flexDirection: "row",
                    children: [
                        {
                            flexWrap: "wrap",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: showMargin ? 20 : 0,
                            children: [...renderChildren],
                        },
                    ],
                },
            ]}
        />
    )
}

const baseStyles = (renderExtra: boolean) => () =>
    StyleSheet.create({
        container: {
            flex: 1,
            width: "100%",
            flexDirection: "column",
            marginTop: renderExtra ? -182 : 0,
        },
    })
