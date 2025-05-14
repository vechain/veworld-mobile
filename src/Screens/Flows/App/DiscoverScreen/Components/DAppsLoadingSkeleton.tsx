import React from "react"
import { FlatList } from "react-native"
import { BaseSkeleton, BaseView } from "~Components"
import { useTheme } from "~Hooks"

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
                                    { width: 72, height: 72, borderRadius: 8, marginRight: 16 },
                                    { width: 80, height: 10 },
                                ],
                            },
                        ]}
                    />
                )}
            />
        </BaseView>
    )
}
