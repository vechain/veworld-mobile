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
                    marginTop: 24,
                    width: SCREEN_WIDTH,
                    justifyContent: "center",
                    alignItems: "center",
                    children: [
                        {
                            width: 247,
                            marginHorizontal: 20,
                            height: 68,
                            borderRadius: 34,
                        },
                    ],
                },
                {
                    flexDirection: "row",
                    paddingTop: 24,
                    children: [
                        {
                            flexWrap: "wrap",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginHorizontal: 20,
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
