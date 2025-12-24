import React, { MutableRefObject, useCallback, useEffect, useMemo } from "react"
import { Pressable, StyleSheet } from "react-native"
import Animated, {
    interpolate,
    interpolateColor,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { BaseText, BaseView } from "~Components/Base"
import { BaseIcon } from "~Components/Base/BaseIcon"
import { SwipeableRow } from "~Components/Reusable/SwipeableRow"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { Network } from "~Model"

type Props = {
    network: Network
    onPress?: (network: Network) => void
    isSelected?: boolean
} & (
    | {
          deletable: true
          onDelete: (network: Network) => void
          swipeableItemRefs: MutableRefObject<Map<string, SwipeableItemImperativeRef>>
      }
    | { deletable?: false }
)

const AnimatedBaseIcon = Animated.createAnimatedComponent(BaseIcon)

const Body = ({ network, isSelected }: Pick<Props, "network" | "isSelected">) => {
    const { theme, styles } = useThemedStyles(baseStyles)
    const textColor = useMemo(() => {
        if (isSelected) return theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE
        return theme.isDark ? COLORS.WHITE : COLORS.GREY_600
    }, [isSelected, theme.isDark])

    const selectedAnimationValue = useSharedValue(Number(isSelected ?? false))

    useEffect(() => {
        selectedAnimationValue.value = withTiming(Number(isSelected ?? false))
    }, [isSelected, selectedAnimationValue])

    const animatedStyles = useAnimatedStyle(() => {
        const selectedColor = theme.isDark ? COLORS.LIME_GREEN : COLORS.PRIMARY_800
        const unselectedColor = theme.isDark ? "transparent" : COLORS.GREY_200
        const borderColor = interpolateColor(selectedAnimationValue.value, [0, 1], [unselectedColor, selectedColor])

        return {
            paddingVertical: interpolate(selectedAnimationValue.value, [0, 1], [12, 16]),
            borderColor,
        }
    }, [selectedAnimationValue.value])

    return (
        <Animated.View style={[styles.root, animatedStyles]}>
            <BaseView flexDirection="column" alignItems="flex-start" flex={1}>
                <BaseText
                    typographyFont={isSelected ? "bodySemiBold" : "bodyMedium"}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    color={textColor}>
                    {network.name}
                </BaseText>
                <BaseText
                    pt={4}
                    typographyFont="captionMedium"
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_500}>
                    {network.currentUrl}
                </BaseText>
            </BaseView>
            <AnimatedBaseIcon
                name="icon-check"
                size={20}
                color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                layout={LinearTransition.delay(500)}
                style={{ opacity: Number(isSelected) }}
            />
        </Animated.View>
    )
}

export const NetworkBox: React.FC<Props> = ({ network, onPress, isSelected = false, ...props }) => {
    const handleOnPress = useCallback(() => !!onPress && onPress(network), [onPress, network])
    const handleDelete = useCallback(() => {
        if (props.deletable) props.onDelete(network)
    }, [props, network])

    if (props.deletable)
        return (
            <SwipeableRow
                testID="SEARCH_RESULT_ITEM_CONTAINER"
                xMargins={0}
                yMargins={0}
                item={network}
                itemKey={network.id}
                snapPointsLeft={[50]}
                handleTrashIconPress={handleDelete}
                swipeableItemRefs={props.swipeableItemRefs}
                onPress={handleOnPress}>
                <Body network={network} isSelected={isSelected} />
            </SwipeableRow>
        )

    return onPress ? (
        <Pressable testID={`NetworkBox_${network.type}`} onPress={handleOnPress}>
            <Body network={network} isSelected={isSelected} />
        </Pressable>
    ) : (
        <Body network={network} isSelected={isSelected} />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.card,
            borderRadius: 8,
            borderWidth: 2,
        },
    })
