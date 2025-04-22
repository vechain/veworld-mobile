import React from "react"
import { useTheme } from "~Hooks"
import { BaseView, BaseSkeleton } from "~Components"
import { FlatList } from "react-native"

export const DAppsLoadingSkeleton = () => {
    const theme = useTheme()

    return (
        <BaseView px={16}>
            <FlatList
                data={[1, 2, 3, 4, 5]}
                keyExtractor={item => item.toString()}
                scrollEnabled={false}
                horizontal
                shouldRasterizeIOS
                renderItem={() => (
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        layout={[
                            {
                                flexDirection: "column",
                                gap: 8,
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                children: [
                                    { width: 96, height: 96, borderRadius: 8, marginRight: 16 },
                                    { width: 80, height: 10 },
                                    { width: 40, height: 8 },
                                ],
                            },
                        ]}
                    />
                )}
            />
        </BaseView>
    )
}
