import React from "react"
import SkeletonContent from "react-native-skeleton-content-nonexpo"
import { useTheme } from "~Hooks"
import { SCREEN_WIDTH } from "~Constants"
import { StyleSheet } from "react-native"

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
                    opacity: 0.3,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginHorizontal: 20,
                    children: [
                        {
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            marginRight: 12,
                            marginTop: 12,
                        },
                        {
                            width: SCREEN_WIDTH - 96,
                            height: 24,
                        },
                    ],
                },

                {
                    marginHorizontal: 20,
                    children: [
                        {
                            opacity: 0.3,
                            width: 128,
                            height: 12,
                            marginTop: 22,
                        },

                        {
                            opacity: 0.3,
                            width: SCREEN_WIDTH - 48,
                            height: 12,
                            marginTop: 22,
                        },

                        {
                            opacity: 0.3,
                            width: SCREEN_WIDTH - 48,
                            height: 12,
                            marginTop: 8,
                        },

                        {
                            opacity: 0.3,
                            width: 128,
                            height: 22,
                            marginTop: 24,
                        },
                    ],
                },

                {
                    opacity: 0.3,
                    flexDirection: "row",
                    paddingTop: 18,
                    marginHorizontal: 20,

                    children: [
                        {
                            flexWrap: "wrap",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            children: [
                                {
                                    width: SCREEN_WIDTH / 2 - 30,
                                    height: 164,
                                    borderRadius: 16,
                                    marginBottom: 16,
                                },
                                {
                                    width: SCREEN_WIDTH / 2 - 30,
                                    height: 164,
                                    borderRadius: 16,
                                    marginBottom: 16,
                                },
                                {
                                    width: SCREEN_WIDTH / 2 - 30,
                                    height: 164,
                                    borderRadius: 16,
                                    marginBottom: 16,
                                },
                                {
                                    width: SCREEN_WIDTH / 2 - 30,
                                    height: 164,
                                    borderRadius: 16,
                                    marginBottom: 16,
                                },
                                {
                                    width: SCREEN_WIDTH / 2 - 30,
                                    height: 164,
                                    borderRadius: 16,
                                    marginBottom: 16,
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
