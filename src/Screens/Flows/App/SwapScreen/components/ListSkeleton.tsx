import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { BaseSkeleton, BaseSpacer } from "~Components"
import { useThemedStyles } from "~Hooks"

const items = [{ key: 1 }, { key: 2 }, { key: 3 }, { key: 4 }, { key: 5 }, { key: 6 }, { key: 7 }, { key: 8 }]

export const ListSkeleton = () => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const renderItem = useCallback(() => {
        return (
            <BaseSkeleton
                containerStyle={styles.card}
                animationDirection="horizontalLeft"
                boneColor={theme.colors.skeletonBoneColor}
                highlightColor={theme.colors.skeletonHighlightColor}
                layout={[
                    {
                        width: 48,
                        height: 48,
                    },
                    {
                        width: "100%",
                        flexDirection: "column",
                        gap: 8,
                        children: [
                            {
                                width: "40%",
                                height: 20,
                            },
                            {
                                width: "20%",
                                height: 10,
                            },
                        ],
                    },
                ]}
            />
        )
    }, [styles.card, theme.colors.skeletonBoneColor, theme.colors.skeletonHighlightColor])

    return (
        <FlatList
            scrollEnabled={false}
            contentContainerStyle={styles.listContentContainer}
            data={items}
            keyExtractor={item => item.key.toString()}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listContentContainer: {
            flexGrow: 1,
        },
        card: {
            height: 84,
            flex: 1,
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
            width: "100%",
            borderRadius: 16,
            overflow: "hidden",
            paddingHorizontal: 16,
        },
    })
