import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView, DAppIcon } from "~Components"
import { DiscoveryDApp } from "~Constants"
import { useDappBookmarking, useThemedStyles } from "~Hooks"
import { DAppUtils, URIUtils } from "~Utils"

const GAP_BETWEEN_CARDS = 10
const CARD_HEIGHT = 84
const COLLAPED_STACK_CARD_SHIFT_SIZE = 8
const ANIMATION_DURATION = 300

type Props = {
    dapps: DiscoveryDApp[]
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

export const FavoritesStackCard = ({ dapps, onDAppPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const startingStackHeight = COLLAPED_STACK_CARD_SHIFT_SIZE * 2 + CARD_HEIGHT
    const finalStackHeight = (CARD_HEIGHT + GAP_BETWEEN_CARDS) * (dapps.length + 1) - GAP_BETWEEN_CARDS

    const [isStacked, setIsStacked] = useState(true)

    const stackHeight = useSharedValue<number>(startingStackHeight)

    useEffect(() => {
        stackHeight.value = withTiming(isStacked ? startingStackHeight : finalStackHeight, {
            duration: ANIMATION_DURATION,
        })
    }, [finalStackHeight, isStacked, stackHeight, startingStackHeight])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: stackHeight.value,
        }
    }, [])

    const cards = useMemo(() => {
        const hostname = URIUtils.getHostName(dapps[0].href)

        const amountOfNavigations = dapps
            .map(dapp => dapp.amountOfNavigations)
            .reduce((total, current) => total + current, 0)

        const dapp = {
            id: dapps.find(item => !!item.id)?.id,
            amountOfNavigations: amountOfNavigations,
            createAt: 0,
            desc: hostname ?? dapps[0]?.desc ?? "",
            href: "header",
            isCustom: true,
            name: dapps[0]?.name ?? hostname,
        }

        return [dapp, ...dapps]
    }, [dapps])

    return (
        <Animated.View style={[styles.stackContainer, animatedStyle]}>
            {cards.map((item, index) => {
                const isFirst = index === 0
                return (
                    <AnimatedCard
                        key={item.href}
                        index={index}
                        dapp={item}
                        isStacked={isStacked}
                        onDAppPress={
                            isFirst ? () => setIsStacked(prev => !prev) : () => onDAppPress({ href: item.href })
                        }
                    />
                )
            })}
        </Animated.View>
    )
}

type AnimatedCardProps = {
    dapp: DiscoveryDApp
    onDAppPress: () => void
    index: number
    isStacked: boolean
}

const AnimatedCard = ({ index, isStacked, onDAppPress, dapp }: AnimatedCardProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const isFirst = index === 0
    const isSecond = index === 1
    const isThird = index === 2

    const topInitialValue = isSecond || isThird ? index * COLLAPED_STACK_CARD_SHIFT_SIZE : 0
    const topFinalValue = (CARD_HEIGHT + GAP_BETWEEN_CARDS) * index

    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.href, dapp?.name)

    const getWidthValue = useCallback(
        (_isStacked: boolean) => {
            switch (true) {
                case _isStacked && isSecond:
                    return 95
                case _isStacked && isThird:
                    return 90
                case _isStacked && !isFirst && !isSecond && !isThird:
                    return 80
                case !_isStacked:
                default:
                    return 100
            }
        },
        [isFirst, isSecond, isThird],
    )

    const top = useSharedValue(topInitialValue)
    const width = useSharedValue(getWidthValue(isStacked))
    const backgroundColorProgress = useSharedValue(isStacked ? 0 : 1)
    const iconOrientationProgress = useSharedValue(isStacked ? 0 : 1)

    const backgroundColorArray = useMemo(() => {
        switch (true) {
            case isSecond:
                return !theme.isDark ? ["#e9e9e9", theme.colors.card] : ["#443A73", theme.colors.card]
            case isThird:
                return !theme.isDark ? ["#d9d9d9", theme.colors.card] : ["#584E87", theme.colors.card]
            case isFirst:
            default:
                return [theme.colors.card, theme.colors.card]
        }
    }, [isFirst, isSecond, isThird, theme.colors.card, theme.isDark])

    useEffect(() => {
        top.value = withTiming(isStacked ? topInitialValue : topFinalValue, {
            duration: ANIMATION_DURATION,
        })

        width.value = withTiming(getWidthValue(isStacked), {
            duration: ANIMATION_DURATION,
        })

        backgroundColorProgress.value = withTiming(isStacked ? 0 : 1, {
            duration: ANIMATION_DURATION,
        })

        iconOrientationProgress.value = withTiming(isStacked ? 0 : 1, {
            duration: ANIMATION_DURATION,
        })
    }, [
        backgroundColorProgress,
        getWidthValue,
        iconOrientationProgress,
        isStacked,
        top,
        topFinalValue,
        topInitialValue,
        width,
    ])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            top: top.value,
            width: `${width.value}%`,
            backgroundColor: interpolateColor(backgroundColorProgress.value, [0, 1], backgroundColorArray),
        }
    }, [backgroundColorArray])

    const dynamicIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${iconOrientationProgress.value * 180}deg` }],
        }
    }, [])

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    zIndex: -index,
                    height: CARD_HEIGHT,
                },
                animatedStyle,
            ]}>
            <BaseTouchable style={styles.contentContainer} activeOpacity={0.3} onPress={onDAppPress}>
                <DAppIcon
                    imageSource={{
                        uri: dapp.id
                            ? DAppUtils.getAppHubIconUrl(dapp.id)
                            : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${dapp.href}`,
                    }}
                />
                <BaseSpacer width={12} />
                <BaseView flex={1}>
                    <BaseText ellipsizeMode="tail" numberOfLines={1} style={styles.nameText}>
                        {dapp.name}
                    </BaseText>
                    <BaseSpacer height={4} />
                    <BaseText ellipsizeMode="tail" numberOfLines={2} style={styles.description}>
                        {dapp.desc ? dapp.desc : dapp.href}
                    </BaseText>
                </BaseView>
                {isFirst ? (
                    <Animated.View style={[dynamicIconStyle]}>
                        <BaseIcon name="chevron-down" color={theme.colors.text} size={36} testID="chevron" />
                    </Animated.View>
                ) : (
                    <BaseIcon
                        onPress={toggleBookmark}
                        name={isBookMarked ? "bookmark" : "bookmark-outline"}
                        color={theme.colors.text}
                        size={24}
                    />
                )}
            </BaseTouchable>
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        stackContainer: {
            alignItems: "center",
        },
        card: {
            position: "absolute",
            borderRadius: 16,
            overflow: "hidden",
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        nameText: {
            fontWeight: "bold",
            fontSize: 16,
        },
        description: {
            fontSize: 12,
        },
        contentContainer: {
            justifyContent: "space-between",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
        },
    })
