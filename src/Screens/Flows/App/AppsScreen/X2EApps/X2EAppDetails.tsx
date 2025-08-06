import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming, withSpring, Easing } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

const SPRING_CONFIG = {
    damping: 20,
    stiffness: 150,
    mass: 1,
}

const TIMING_CONFIG = {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
}

const LAYOUT_TRANSITION = LinearTransition.springify().damping(20).stiffness(100).mass(0.6)

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

const Title = React.memo(({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.x2eAppOpenDetails.title}>
            {children}
        </BaseText>
    )
})

const Description = React.memo(({ children }: { children: string }) => {
    const theme = useTheme()

    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="row" gap={8} alignItems="flex-start">
            <BaseView>
                <BaseText color={theme.colors.x2eAppOpenDetails.description} typographyFont="captionMedium">
                    {children}
                </BaseText>
            </BaseView>
        </AnimatedBaseView>
    )
})

interface StatItemProps {
    value: string
    label: string
}

const StatItem = React.memo(({ value, label }: StatItemProps) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="column" gap={2}>
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.x2eAppOpenDetails.stats.value}>
                {value}
            </BaseText>
            <BaseText typographyFont="captionMedium" color={theme.colors.x2eAppOpenDetails.stats.caption}>
                {label}
            </BaseText>
        </BaseView>
    )
})

interface StatsProps {
    rating?: StatItemProps
    users?: StatItemProps
    co2Saved?: StatItemProps
    customStats?: StatItemProps[]
}

const Stats = React.memo(
    ({
        rating = { value: "4.5", label: "Rating" },
        users = { value: "1.1M", label: "Users" },
        co2Saved = { value: "10.8 T", label: "CO2 saved" },
        customStats = [],
    }: StatsProps) => {
        return (
            <AnimatedBaseView
                layout={LAYOUT_TRANSITION}
                flexDirection="row"
                justifyContent="space-between"
                py={4}
                px={8}
                gap={8}>
                {rating && <StatItem value={rating.value} label={rating.label} />}
                {users && <StatItem value={users.value} label={users.label} />}
                {co2Saved && <StatItem value={co2Saved.value} label={co2Saved.label} />}
                {customStats.map(stat => (
                    <StatItem key={stat.label} value={stat.value} label={stat.label} />
                ))}
            </AnimatedBaseView>
        )
    },
)

interface FavoriteButtonProps {
    onAddToFavorites?: () => void
    isFavorite?: boolean
}

const FavoriteButton = React.memo(({ onAddToFavorites = () => {}, isFavorite = false }: FavoriteButtonProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const favoriteColors = theme.colors.x2eAppOpenDetails.favoriteBtn
    const buttonColors = isFavorite
        ? {
              backgroundColor: favoriteColors.backgroundActive,
              borderColor: favoriteColors.borderActive,
              textColor: favoriteColors.textActive,
          }
        : {
              backgroundColor: favoriteColors.backgroundInactive,
              borderColor: favoriteColors.borderInactive,
              textColor: favoriteColors.textInactive,
          }

    return (
        <BaseButton
            flex={1}
            action={onAddToFavorites}
            variant="outline"
            style={{
                backgroundColor: buttonColors.backgroundColor,
                borderColor: buttonColors.borderColor,
            }}>
            <BaseIcon name={isFavorite ? "icon-star-on" : "icon-star"} size={16} color={buttonColors.textColor} />
            <BaseSpacer width={12} />
            <BaseText typographyFont="bodyMedium" color={buttonColors.textColor}>
                {isFavorite ? LL.BTN_FAVORiTED() : LL.BTN_FAVORITE()}
            </BaseText>
        </BaseButton>
    )
})

interface ActionsProps {
    onAddToFavorites?: () => void
    onOpen?: () => void
    isFavorite?: boolean
}

const Actions = React.memo(({ onAddToFavorites = () => {}, onOpen = () => {}, isFavorite = false }: ActionsProps) => {
    const { LL } = useI18nContext()

    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="row" gap={8} w={100}>
            <FavoriteButton onAddToFavorites={onAddToFavorites} isFavorite={isFavorite} />
            <BaseButton flex={1} action={onOpen}>
                {LL.BTN_OPEN()}
            </BaseButton>
        </AnimatedBaseView>
    )
})

const Container = React.memo(({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="column" gap={8} px={24} pb={24}>
            {children}
        </AnimatedBaseView>
    )
})

type Props = PropsWithChildren<{
    show: boolean
    visible?: boolean
}>

const X2EAppDetails = ({ children, show, visible = show }: Props) => {
    const shouldShow = show && visible

    const containerStyle = useAnimatedStyle(() => {
        if (shouldShow) {
            return {
                opacity: withSpring(1, SPRING_CONFIG),
                maxHeight: withSpring(1000, SPRING_CONFIG),
                overflow: "hidden",
            }
        } else {
            return {
                opacity: withTiming(0, TIMING_CONFIG),
                maxHeight: withTiming(0, TIMING_CONFIG),
                overflow: "hidden",
            }
        }
    }, [shouldShow])

    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} style={[styles.container, containerStyle]} flexDirection="column">
            {children}
        </AnimatedBaseView>
    )
}

X2EAppDetails.Title = Title
X2EAppDetails.Description = Description
X2EAppDetails.Stats = Stats
X2EAppDetails.Actions = Actions
X2EAppDetails.Container = Container

export { X2EAppDetails }

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
})
