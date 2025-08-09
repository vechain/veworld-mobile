import React, { PropsWithChildren } from "react"
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"
import { LAYOUT_TRANSITION, SPRING_CONFIG, TIMING_CONFIG } from "./constants"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

const Description = React.memo(({ children }: { children: string }) => {
    const theme = useTheme()

    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="row" gap={16} alignItems="flex-start">
            <BaseView>
                <BaseText
                    color={theme.colors.x2eAppOpenDetails.description}
                    typographyFont="captionMedium"
                    lineHeight={16}>
                    {children}
                </BaseText>
            </BaseView>
        </AnimatedBaseView>
    )
})

interface StatItemProps {
    value: string
    label: string
    icon: IconKey
}

const StatItem = React.memo(({ value, label, icon }: StatItemProps) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="column" alignItems="center" justifyContent="center">
            <BaseIcon name={icon} size={20} color={theme.colors.x2eAppOpenDetails.favoriteBtn.borderActive} />
            <BaseSpacer height={8} />
            <BaseText typographyFont="captionMedium" color={theme.colors.x2eAppOpenDetails.stats.caption}>
                {label}
            </BaseText>
            <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.x2eAppOpenDetails.stats.value}>
                {value}
            </BaseText>
        </BaseView>
    )
})

interface StatsProps {
    joined?: StatItemProps
    users?: StatItemProps
    actions?: StatItemProps
}

const Stats = React.memo(
    ({
        joined = { value: "4.5", label: "Joined", icon: "icon-certified" },
        users = { value: "1.1M", label: "Users", icon: "icon-users" },
        actions = { value: "10.8 T", label: "Actions", icon: "icon-leaf" },
    }: StatsProps) => {
        return (
            <AnimatedBaseView
                layout={LAYOUT_TRANSITION}
                flexDirection="row"
                justifyContent="space-between"
                py={8}
                gap={8}>
                {joined && <StatItem value={joined.value} label={joined.label} icon={joined.icon} />}
                {users && <StatItem value={users.value} label={users.label} icon={users.icon} />}
                {actions && <StatItem value={actions.value} label={actions.label} icon={actions.icon} />}
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
            <BaseSpacer width={10} />
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
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="row" gap={8} w={100} mt={8}>
            <FavoriteButton onAddToFavorites={onAddToFavorites} isFavorite={isFavorite} />
            <BaseButton flex={1} action={onOpen}>
                {LL.BTN_OPEN()}
            </BaseButton>
        </AnimatedBaseView>
    )
})

const Container = React.memo(({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="column" gap={16} px={24} pb={24}>
            {children}
        </AnimatedBaseView>
    )
})

type Props = PropsWithChildren<{
    show: boolean
    visible?: boolean
}>

const RowExpandableDetails = ({ children, show, visible = show }: Props) => {
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
        <AnimatedBaseView layout={LAYOUT_TRANSITION} style={[containerStyle]} flexDirection="column">
            {children}
        </AnimatedBaseView>
    )
}

RowExpandableDetails.Description = Description
RowExpandableDetails.Stats = Stats
RowExpandableDetails.Actions = Actions
RowExpandableDetails.Container = Container

export { RowExpandableDetails }
