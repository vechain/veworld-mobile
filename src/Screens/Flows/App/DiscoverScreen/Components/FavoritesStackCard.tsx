import React, { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated, { useSharedValue, withTiming } from "react-native-reanimated"
import { DiscoveryDApp } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { URIUtils } from "~Utils"
import { FavoriteDAppCard } from "./FavoriteDAppCard"

const GAP_BETWEEN_CARDS = 10
const CARD_HEIGHT = 84
const COLLAPED_STACK_CARD_SHIFT_SIZE = 10
const ANIMATION_DURATION = 500

type Props = {
    dapps: DiscoveryDApp[]
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
}

export const FavoritesStackCard = ({ dapps, onDAppPress }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const [isOpen, setIsOpen] = useState(false)

    const startingStackHeight = COLLAPED_STACK_CARD_SHIFT_SIZE * 2 + CARD_HEIGHT
    const finalStackHeight = (CARD_HEIGHT + GAP_BETWEEN_CARDS) * (dapps.length + 1) - GAP_BETWEEN_CARDS
    const stackHeight = useSharedValue<number>(startingStackHeight)

    useEffect(() => {
        stackHeight.value = withTiming(isOpen ? finalStackHeight : startingStackHeight, {
            duration: ANIMATION_DURATION,
        })
    }, [finalStackHeight, isOpen, stackHeight, startingStackHeight])

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
        <Animated.View
            style={[
                {
                    height: stackHeight,
                },
                styles.stackContainer,
            ]}>
            {cards.map((dapp, index) => {
                const isFirst = index === 0
                return (
                    <AnimatedCard
                        key={dapp.href}
                        dapp={dapp}
                        onDAppPress={isFirst ? () => setIsOpen(prev => !prev) : onDAppPress}
                        isStacked={!isOpen}
                        index={index}
                    />
                )
            })}
        </Animated.View>
    )
}

type AnimatedCardProps = {
    dapp: DiscoveryDApp
    onDAppPress: ({ href }: { href: string; custom?: boolean }) => void
    index: number
    isStacked: boolean
}

const AnimatedCard = ({ dapp, onDAppPress, index, isStacked }: AnimatedCardProps) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const isFirstCard = index === 0
    const isSecondCard = index === 1
    const isThirdCard = index === 2
    const topInitialValue = isSecondCard || isThirdCard ? index * COLLAPED_STACK_CARD_SHIFT_SIZE : 0
    const topFinalValue = (CARD_HEIGHT + GAP_BETWEEN_CARDS) * index
    const paddingHorizontalFinalValue = 0

    const getPaddingHorizontalInitialValue = useCallback(() => {
        if (isStacked && isSecondCard) {
            return 3
        } else {
            return isStacked && isThirdCard ? 6 : 0
        }
    }, [isSecondCard, isStacked, isThirdCard])

    const top = useSharedValue<number>(topInitialValue)
    const paddingHorizontal = useSharedValue<number>(getPaddingHorizontalInitialValue())

    const getIconName = () => {
        if (isFirstCard) {
            return isStacked ? "chevron-down" : "chevron-up"
        }
    }

    useEffect(() => {
        if (isStacked) {
            top.value = withTiming(topInitialValue, {
                duration: ANIMATION_DURATION,
            })
            paddingHorizontal.value = withTiming(getPaddingHorizontalInitialValue(), {
                duration: ANIMATION_DURATION,
            })
        } else {
            top.value = withTiming(topFinalValue, {
                duration: ANIMATION_DURATION,
            })
            paddingHorizontal.value = withTiming(paddingHorizontalFinalValue, {
                duration: ANIMATION_DURATION,
            })
        }
    }, [index, isStacked, paddingHorizontal, getPaddingHorizontalInitialValue, top, topFinalValue, topInitialValue])

    const backgroundColor = () => {
        if (isStacked) {
            if (isSecondCard) {
                return !theme.isDark ? "#F2F2F2" : "#443A73"
            } else if (isThirdCard) {
                return !theme.isDark ? "#E6E6E6" : "#584E87"
            }
        }
    }

    return isStacked && index > 2 ? null : (
        <Animated.View
            style={[
                {
                    zIndex: -index,
                    top: top,
                    paddingHorizontal: paddingHorizontal,
                },
                styles.animtedCard,
            ]}>
            <FavoriteDAppCard
                dapp={dapp}
                onDAppPress={onDAppPress}
                disabled={isStacked && !isFirstCard}
                iconName={getIconName()}
                iconPressDisabled={isFirstCard}
                activeOpacity={isFirstCard ? 1 : undefined}
                backgroundColor={backgroundColor()}
                opacity={1}
            />
        </Animated.View>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        stackContainer: {
            alignItems: "center",
        },
        animtedCard: {
            position: "absolute",
            width: "100%",
        },
    })
