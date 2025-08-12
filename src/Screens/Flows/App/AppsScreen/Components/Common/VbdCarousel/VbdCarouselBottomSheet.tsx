import React, { ElementType, useCallback, useEffect, useMemo, useState } from "react"
import { ImageBackground, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { getTimeZone } from "react-native-localize"
import {
    BaseBottomSheet,
    BaseButton,
    BaseIcon,
    BaseIconProps,
    BaseSkeleton,
    BaseSpacer,
    BaseText,
    BaseView,
    BlurView,
} from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdDApp } from "~Model"

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { BadgeCheckIconSVG } from "~Assets/IconComponents/BadgeCheckIconSVG"
import { FetchAppOverviewResponse } from "~Networking/API/Types"
import { fetchAppOverview } from "~Networking/DApps/fetchAppOverview"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"
import { addBookmark, removeBookmark, selectFavoritesDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { BigNutils, DateUtils, URIUtils } from "~Utils"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

type VbdCarouselBottomSheetProps = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app: VbdDApp
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}

const ANIMATION_DEFAULT = {
    timing: 600,
    scale: 0.9,
    translateY: 50,
    opacity: 0,
}

const VbdInfoColumn = ({
    Icon,
    title,
    description,
    isLoading,
}: {
    Icon: ElementType
    title: string
    description: string
    isLoading?: boolean
}) => {
    const theme = useTheme()
    const color = useMemo(() => (!theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.LIME_GREEN), [theme.isDark])

    return (
        <BaseView justifyContent="center" alignItems="center" p={12} w={33.33}>
            <Icon fill={color} color={color} size={20} />
            <BaseText typographyFont="smallCaptionRegular" mt={8} mb={4}>
                {title}
            </BaseText>
            {isLoading ? (
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    width={"100%"}
                    height={19}
                />
            ) : (
                <BaseText typographyFont="bodyMedium">{description}</BaseText>
            )}
        </BaseView>
    )
}

const UsersIcon = (props: Partial<BaseIconProps>) => <BaseIcon name="icon-users" {...props} />
const LeafIcon = (props: Partial<BaseIconProps>) => <BaseIcon name="icon-leaf" {...props} />

export const VbdCarouselBottomSheet = ({
    isOpen,
    setIsOpen,
    bannerUri,
    iconUri,
    category,
    app,
}: VbdCarouselBottomSheetProps) => {
    const { LL, locale } = useI18nContext()
    const theme = useTheme()
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const opacity = useSharedValue(ANIMATION_DEFAULT.opacity)
    const scale = useSharedValue(ANIMATION_DEFAULT.scale)
    const translateY = useSharedValue(ANIMATION_DEFAULT.translateY)
    const favorites = useAppSelector(selectFavoritesDapps)
    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions()
    const [appOverview, setAppOverview] = useState<FetchAppOverviewResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const isFavorite = favorites.some(favorite => URIUtils.compareURLs(favorite.href, app.external_url))

    const handleClose = useCallback(() => {
        setTimeout(() => {
            onClose()
            setIsOpen(false)
        }, ANIMATION_DEFAULT.timing / 2)
    }, [onClose, setIsOpen])

    const animateClose = useCallback(() => {
        scale.value = withTiming(ANIMATION_DEFAULT.scale, { duration: ANIMATION_DEFAULT.timing })
        translateY.value = withTiming(ANIMATION_DEFAULT.translateY, { duration: ANIMATION_DEFAULT.timing })
        opacity.value = withTiming(ANIMATION_DEFAULT.opacity, { duration: ANIMATION_DEFAULT.timing })
        handleClose()
    }, [handleClose, opacity, scale, translateY])

    const onToggleFavorite = useCallback(() => {
        if (!isFavorite) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app.external_url }))
        }
    }, [app, dispatch, isFavorite])

    const getAppOverview = useCallback(async () => {
        if (app.id && !appOverview) {
            setIsLoading(true)
            const overview = await fetchAppOverview(app.id)
            setAppOverview(overview)
            setIsLoading(false)
        }
    }, [app, appOverview])

    const onOpenApp = useCallback(() => {
        onDAppPress(app)
        animateClose()
    }, [app, onDAppPress, animateClose])

    useEffect(() => {
        if (isOpen) {
            opacity.value = withTiming(1, { duration: ANIMATION_DEFAULT.timing })
            scale.value = withTiming(1, { duration: ANIMATION_DEFAULT.timing })
            translateY.value = withTiming(0, { duration: ANIMATION_DEFAULT.timing })
            getAppOverview()
            onOpen()
        } else {
            animateClose()
        }
    }, [isOpen, onOpen, onClose, opacity, animateClose, scale, translateY, getAppOverview])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }, { translateY: translateY.value }],
        }
    }, [opacity, scale])

    const date = useMemo(() => {
        return DateUtils.formatDateTime(
            Number(app.createdAtTimestamp) * 1000,
            locale,
            getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
            { hideTime: true, hideDay: true },
        )
    }, [app.createdAtTimestamp, locale])

    const usersNum = useMemo(
        () => BigNutils(appOverview?.totalUniqueUserInteractions ?? 0).toCompactString(locale),
        [locale, appOverview],
    )
    const actionsNum = useMemo(
        () => BigNutils(appOverview?.actionsRewarded ?? 0).toCompactString(locale),
        [locale, appOverview],
    )

    return (
        <BaseBottomSheet
            blurBackdrop
            dynamicHeight
            backgroundStyle={{
                backgroundColor: theme.colors.actionBottomSheet.background,
            }}
            enablePanDownToClose={false}
            onPressOutside="none"
            noMargins
            floating
            ref={ref}>
            <BaseView testID="VBD_CAROUSEL_ITEM" style={styles.root}>
                <Animated.View style={[styles.heroWrapper, animatedStyle]}>
                    <ImageBackground
                        source={{ uri: bannerUri }}
                        style={styles.hero}
                        borderTopLeftRadius={24}
                        borderTopRightRadius={24}>
                        <BaseIcon
                            style={styles.closeBtn}
                            color={COLORS.WHITE}
                            size={22}
                            name="icon-x"
                            action={animateClose}
                            testID="bottom-sheet-close-btn"
                        />
                    </ImageBackground>
                </Animated.View>
                <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                    <BaseView px={20} pt={16} pb={12} flexDirection="column" gap={8}>
                        <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                            <BaseView flexDirection="row" alignItems="center">
                                <FastImage source={{ uri: iconUri }} style={styles.logo as ImageStyle} />
                                <BaseSpacer width={12} flexShrink={0} />
                                <BaseText
                                    numberOfLines={1}
                                    typographyFont="subSubTitleSemiBold"
                                    color={COLORS.GREY_50}
                                    testID="VBD_CAROUSEL_ITEM_APP_NAME">
                                    {app.name}
                                </BaseText>
                            </BaseView>
                            <BaseView flexDirection="row">
                                {category && (
                                    <BaseView flexDirection="row" alignItems="center">
                                        <BaseSpacer width={24} flexShrink={0} />
                                        <CategoryChip category={category} />
                                    </BaseView>
                                )}
                            </BaseView>
                        </BaseView>
                        <BaseText
                            typographyFont="captionMedium"
                            color={COLORS.WHITE_RGBA_85}
                            numberOfLines={15}
                            flexDirection="row"
                            py={5}
                            testID="VBD_CAROUSEL_ITEM_APP_DESCRIPTION">
                            {app.description}
                        </BaseText>
                    </BaseView>
                </BlurView>
            </BaseView>
            <BaseView bg={theme.colors.actionBottomSheet.background}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={8} px={30} pt={16}>
                    <VbdInfoColumn Icon={BadgeCheckIconSVG} title={LL.APPS_BS_JOINED()} description={date} />
                    <VbdInfoColumn
                        Icon={UsersIcon}
                        title={LL.APPS_BS_USERS()}
                        description={usersNum}
                        isLoading={isLoading}
                    />
                    <VbdInfoColumn
                        Icon={LeafIcon}
                        title={LL.APPS_BS_ACTIONS()}
                        description={actionsNum}
                        isLoading={isLoading}
                    />
                </BaseView>
                <BaseView px={24} pt={16} pb={10} gap={12}>
                    <BaseButton
                        testID="Favorite_Button"
                        style={styles.btn}
                        leftIcon={
                            isFavorite ? (
                                <BaseIcon
                                    style={styles.favIcon}
                                    color={theme.isDark ? COLORS.LIME_GREEN : undefined}
                                    size={20}
                                    name="icon-star-on"
                                    testID="bottom-sheet-remove-favorite-icon"
                                />
                            ) : (
                                <BaseIcon
                                    style={styles.favIcon}
                                    color={theme.isDark ? COLORS.WHITE : undefined}
                                    size={20}
                                    name="icon-star"
                                    testID="bottom-sheet-add-favorite-icon"
                                />
                            )
                        }
                        action={onToggleFavorite}
                        title={isFavorite ? LL.APPS_BS_BTN_REMOVE_FAVORITE() : LL.APPS_BS_BTN_ADD_FAVORITE()}
                        variant="outline"
                        textColor={theme.isDark ? (isFavorite ? COLORS.LIME_GREEN : COLORS.WHITE) : undefined}
                        borderColor={theme.isDark ? (isFavorite ? COLORS.LIME_GREEN : COLORS.WHITE) : undefined}
                    />
                    <BaseButton
                        testID="Open_Button"
                        style={styles.btn}
                        action={onOpenApp}
                        title={LL.APPS_BS_BTN_OPEN_APP()}
                    />
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
}

const styles = StyleSheet.create({
    root: {
        position: "relative",
        overflow: "hidden",
        height: 360,
        zIndex: 1,
        marginTop: -360,
    },
    heroWrapper: {
        width: "100%",
        height: "100%",
    },
    hero: {
        height: "100%",
        width: "100%",
    },
    btn: {
        justifyContent: "center",
    },
    favIcon: {
        marginRight: 12,
        marginVertical: -2,
    },
    blurView: {
        backgroundColor: "rgba(0, 0, 0, 0.30)",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.30)",
        borderRadius: 100,
        padding: 10,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
})
