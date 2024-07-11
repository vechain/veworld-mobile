import React, { useEffect, useMemo, useState } from "react"
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

    const headerCard: DiscoveryDApp = useMemo(() => {
        const hostname = URIUtils.getHostName(dapps[0].href)

        const amountOfNavigations = dapps
            .map(dapp => dapp.amountOfNavigations)
            .reduce((total, current) => total + current, 0)

        const dapp = {
            id: dapps.find(item => !!item.id)?.id,
            amountOfNavigations: amountOfNavigations,
            createAt: 0,
            desc: hostname ?? dapps[0]?.desc ?? "",
            href: hostname ? `https://www.${hostname}` : dapps[0]?.href ?? "",
            isCustom: true,
            name: dapps[0]?.name ?? hostname,
        }

        return dapp
    }, [dapps])

    return (
        <Animated.View
            style={[
                {
                    height: stackHeight,
                },
                styles.stackContainer,
            ]}>
            {[headerCard, ...dapps].map((dapp, index) => {
                return (
                    <AnimatedCard
                        key={index}
                        dapp={dapp}
                        onDAppPress={index === 0 ? () => setIsOpen(prev => !prev) : onDAppPress}
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
    const paddingHorizontalInitialValue = isStacked && index === 1 ? 3 : isStacked && index === 2 ? 6 : 0
    const paddingHorizontalFinalValue = 0

    const top = useSharedValue<number>(topInitialValue)
    const paddingHorizontal = useSharedValue<number>(paddingHorizontalInitialValue)

    const iconName = index === 0 ? (isStacked ? "chevron-down" : "chevron-up") : undefined

    useEffect(() => {
        if (isStacked) {
            top.value = withTiming(topInitialValue, {
                duration: ANIMATION_DURATION,
            })
            paddingHorizontal.value = withTiming(paddingHorizontalInitialValue, {
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
    }, [index, isStacked, paddingHorizontal, paddingHorizontalInitialValue, top, topFinalValue, topInitialValue])

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
                iconName={iconName}
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
