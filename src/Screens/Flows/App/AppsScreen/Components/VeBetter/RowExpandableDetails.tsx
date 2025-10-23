import React, { PropsWithChildren, useMemo } from "react"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSkeleton, BaseSpacer, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { BigNutils, DateUtils } from "~Utils"
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
                    lineHeight={16}
                    flexDirection="row"
                    numberOfLines={5}>
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

const StatItem = React.memo(({ value, label, icon, isLoading = false }: StatItemProps & { isLoading?: boolean }) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="column" alignItems="center" justifyContent="center">
            <BaseIcon name={icon} size={20} color={theme.colors.x2eAppOpenDetails.favoriteBtn.borderActive} />
            <BaseSpacer height={8} />
            <BaseText typographyFont="smallCaptionMedium" color={theme.colors.x2eAppOpenDetails.stats.caption}>
                {label}
            </BaseText>
            <BaseSpacer height={2} />
            {isLoading ? (
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    width={60}
                    height={16}
                />
            ) : (
                <BaseText typographyFont="bodySemiBold" color={theme.colors.x2eAppOpenDetails.stats.value}>
                    {value}
                </BaseText>
            )}
        </BaseView>
    )
})

interface StatsProps {
    appOverview?: FetchAppOverviewResponse
    isLoading?: boolean
    createdAtTimestamp?: string
    joined?: StatItemProps
    users?: StatItemProps
    actions?: StatItemProps
}

const Stats = React.memo(
    ({
        appOverview,
        isLoading = false,
        createdAtTimestamp,
        joined = { value: "", label: "Joined", icon: "icon-certified" },
        users = { value: "", label: "Users", icon: "icon-users" },
        actions = { value: "", label: "Actions", icon: "icon-leaf" },
    }: StatsProps) => {
        const { locale } = useI18nContext()

        const joinedDate = useMemo(() => {
            if (createdAtTimestamp) {
                return DateUtils.formatDateTime(
                    Number(createdAtTimestamp) * 1000,
                    locale,
                    getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                    { hideTime: true, hideDay: true },
                )
            }
            return joined.value
        }, [createdAtTimestamp, locale, joined.value])

        const usersCount = useMemo(() => {
            if (appOverview?.totalUniqueUserInteractions !== undefined) {
                return BigNutils(appOverview.totalUniqueUserInteractions).toCompactString(locale)
            }
            return users.value
        }, [appOverview?.totalUniqueUserInteractions, users.value, locale])

        const actionsCount = useMemo(() => {
            if (appOverview?.actionsRewarded !== undefined) {
                return BigNutils(appOverview.actionsRewarded).toCompactString(locale)
            }
            return actions.value
        }, [appOverview?.actionsRewarded, actions.value, locale])

        return (
            <AnimatedBaseView
                layout={LAYOUT_TRANSITION}
                flexDirection="row"
                justifyContent="space-between"
                py={8}
                gap={8}>
                <StatItem value={joinedDate} label={joined.label} icon={joined.icon} isLoading={false} />
                <StatItem value={usersCount} label={users.label} icon={users.icon} isLoading={isLoading} />
                <StatItem value={actionsCount} label={actions.label} icon={actions.icon} isLoading={isLoading} />
            </AnimatedBaseView>
        )
    },
)

interface ActionsProps {
    onAddToFavorites?: () => void
    onOpen?: () => void
    isFavorite?: boolean
}

const Actions = React.memo(({ onAddToFavorites = () => {}, onOpen = () => {}, isFavorite = false }: ActionsProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const favoriteColors = theme.colors.x2eAppOpenDetails.favoriteBtn

    const leftIcon = useMemo(() => {
        return isFavorite ? (
            <BaseIcon
                style={styles.favIcon}
                color={favoriteColors.textActive}
                size={20}
                name="icon-star-on"
                testID="row-expandable-remove-favorite-icon"
            />
        ) : (
            <BaseIcon
                style={styles.favIcon}
                color={favoriteColors.textInactive}
                size={20}
                name="icon-star"
                testID="row-expandable-add-favorite-icon"
            />
        )
    }, [isFavorite, styles.favIcon, favoriteColors.textActive, favoriteColors.textInactive])

    const favButtonStyles = useMemo(() => {
        if (isFavorite) {
            return {
                textColor: favoriteColors.textActive,
                borderColor: favoriteColors.borderActive,
                backgroundColor: favoriteColors.backgroundActive,
            }
        }
        return {
            textColor: favoriteColors.textInactive,
            borderColor: favoriteColors.borderInactive,
            backgroundColor: favoriteColors.backgroundInactive,
        }
    }, [isFavorite, favoriteColors])

    return (
        <AnimatedBaseView layout={LAYOUT_TRANSITION} flexDirection="row" gap={16} mt={8}>
            <BaseButton
                testID="Favorite_Button"
                style={[styles.btn, { backgroundColor: favButtonStyles.backgroundColor }]}
                leftIcon={leftIcon}
                action={onAddToFavorites}
                title={isFavorite ? LL.APPS_BS_BTN_REMOVE_FAVORITE() : LL.COMMON_LBL_FAVOURITE()}
                variant="outline"
                textColor={favButtonStyles.textColor}
                borderColor={favButtonStyles.borderColor}
                flex={1}
            />
            <BaseButton
                testID="Open_Button"
                style={styles.btn}
                action={onOpen}
                title={LL.APPS_BS_BTN_OPEN_APP()}
                flex={1}
            />
        </AnimatedBaseView>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        buttonHeight: {
            height: 48,
            justifyContent: "center",
        },
        btn: {
            justifyContent: "center",
            height: 48,
        },
        favIcon: {
            marginRight: 12,
            marginVertical: -2,
        },
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
