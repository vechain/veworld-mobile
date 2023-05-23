import React from "react"
import SkeletonContent from "react-native-skeleton-content"
import { useTheme } from "~Common"
import { StyleSheet } from "react-native"

const ITEM_SIZE: number = 152
const ITEM_SPACING: number = 16

export const NftSkeleton = () => {
    const theme = useTheme()

    return (
        <SkeletonContent
            containerStyle={baseStyles.container}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 20,

                    children: [
                        // Circle
                        { width: 32, height: 32, borderRadius: 16 },
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                // Line
                                {
                                    width: "30%",
                                    height: 24,
                                    marginLeft: 10,
                                },
                            ],
                        },
                    ],
                },
                {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    paddingLeft: 20,
                    marginTop: 22,

                    children: [
                        {
                            flexDirection: "row",
                            alignItems: "flex-start",
                            width: "100%",

                            children: [
                                // boxes
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                    marginRight: 16,
                                },
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                    marginRight: 16,
                                },
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                },
                            ],
                        },
                    ],
                },
                {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 20,
                    paddingTop: 42,

                    children: [
                        // Circle
                        { width: 32, height: 32, borderRadius: 16 },
                        {
                            flexDirection: "column",
                            alignItems: "flex-start",
                            width: "100%",
                            children: [
                                // Line
                                {
                                    width: "30%",
                                    height: 24,
                                    marginLeft: 10,
                                },
                            ],
                        },
                    ],
                },
                {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    paddingLeft: 20,
                    marginTop: 22,

                    children: [
                        {
                            flexDirection: "row",
                            alignItems: "flex-start",
                            width: "100%",

                            children: [
                                // boxes
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                    marginRight: 16,
                                },
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                    marginRight: 16,
                                },
                                {
                                    width: ITEM_SIZE,
                                    height: ITEM_SIZE,
                                    borderRadius: ITEM_SPACING,
                                },
                            ],
                        },
                    ],
                },
            ]}
            isLoading={true}
        />
    )
}

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        marginLeft: -1,
        paddingBottom: 18,
    },
})
