import React from "react"
import SkeletonContent from "react-native-skeleton-content-nonexpo"
import { SCREEN_WIDTH, useTheme } from "~Common"
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
                    flexDirection: "row",
                    paddingTop: 24,
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
