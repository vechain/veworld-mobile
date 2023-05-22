import React, { memo } from "react"
import { StyleSheet, ViewProps } from "react-native"
import Animated, { AnimateProps } from "react-native-reanimated"
import { ColorThemeType, useThemedStyles } from "~Common"
import { BaseView } from "~Components"
import { CollectionAccordion } from "./CollectionAccordion"
import { selectNftCollections, useAppSelector } from "~Storage/Redux"

interface Props extends AnimateProps<ViewProps> {}

export const CollectionsList = memo(({ ...animatedViewProps }: Props) => {
    const { styles: themedStyles } = useThemedStyles(baseStyles)

    const nftCollections = useAppSelector(selectNftCollections)

    return (
        <Animated.View style={themedStyles.container} {...animatedViewProps}>
            {nftCollections.map((data, index) => (
                <BaseView
                    key={`${index}-${data.address}`}
                    style={themedStyles.innerContainer}>
                    <CollectionAccordion collection={data} />
                </BaseView>
            ))}
        </Animated.View>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            width: "100%",
            backgroundColor: theme.colors.background,
        },
        innerContainer: { paddingVertical: 12 },
    })
