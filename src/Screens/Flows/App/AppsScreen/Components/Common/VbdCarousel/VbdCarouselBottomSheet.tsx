import React, { ElementType, useCallback, useEffect, useMemo, useState } from "react"
import { BackHandler, ImageBackground, StyleSheet } from "react-native"
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
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useTheme, useThemedStyles } from "~Hooks"
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

export type VbdCarouselBottomSheetMetadata = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app?: VbdDApp
}

type VbdCarouselBottomSheetProps = {
    isOpen: boolean
    onClose: () => void
} & VbdCarouselBottomSheetMetadata

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
    onClose,
    bannerUri,
    iconUri,
    category,
    app,
}: VbdCarouselBottomSheetProps) => {
    const { LL, locale } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { ref, onOpen, onClose: onCloseBS } = useBottomSheetModal()

    const opacity = useSharedValue(ANIMATION_DEFAULT.opacity)
    const scale = useSharedValue(ANIMATION_DEFAULT.scale)
    const translateY = useSharedValue(ANIMATION_DEFAULT.translateY)

    const favorites = useAppSelector(selectFavoritesDapps)
    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions()

    const [appOverview, setAppOverview] = useState<Partial<FetchAppOverviewResponse>>({})
    const [isLoading, setIsLoading] = useState(true)

    const isFavorite = useMemo(
        () => favorites.some(favorite => URIUtils.compareURLs(favorite.href, app?.external_url)),
        [app?.external_url, favorites],
    )

    const handleClose = useCallback(() => {
        onClose()
        onCloseBS()
        setAppOverview({})
    }, [onClose, onCloseBS])

    const animateClose = useCallback(() => {
        scale.value = withTiming(ANIMATION_DEFAULT.scale, { duration: ANIMATION_DEFAULT.timing })
        translateY.value = withTiming(ANIMATION_DEFAULT.translateY, { duration: ANIMATION_DEFAULT.timing })
        opacity.value = withTiming(ANIMATION_DEFAULT.opacity, { duration: ANIMATION_DEFAULT.timing })
        handleClose()
    }, [handleClose, opacity, scale, translateY])

    const getAppOverview = useCallback(async () => {
        if (app?.id) {
            setIsLoading(true)
            const overview = await fetchAppOverview(app?.id)
            setAppOverview(overview)
            setIsLoading(false)
        }
    }, [app?.id])

    const onToggleFavorite = useCallback(() => {
        if (!isFavorite && app) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app?.external_url ?? "" }))
        }
    }, [app, dispatch, isFavorite])

    const onOpenApp = useCallback(() => {
        if (app) onDAppPress(app)
        animateClose()
    }, [app, onDAppPress, animateClose])

    useEffect(() => {
        if (isOpen) {
            opacity.value = withTiming(1, { duration: ANIMATION_DEFAULT.timing })
            scale.value = withTiming(1, { duration: ANIMATION_DEFAULT.timing })
            translateY.value = withTiming(0, { duration: ANIMATION_DEFAULT.timing })
            getAppOverview()
            onOpen()
        }
    }, [isOpen, onOpen, opacity, scale, translateY, getAppOverview])

    const animatedStyle = useAnimatedStyle(
        () => ({
            opacity: opacity.value,
            transform: [{ scale: scale.value }, { translateY: translateY.value }],
        }),
        [opacity, scale],
    )

    const date = useMemo(
        () =>
            DateUtils.formatDateTime(
                Number(app?.createdAtTimestamp) * 1000,
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                { hideTime: true, hideDay: true },
            ),
        [app?.createdAtTimestamp, locale],
    )

    const usersNum = useMemo(
        () => BigNutils(appOverview?.totalUniqueUserInteractions ?? 0).toCompactString(locale),
        [locale, appOverview],
    )
    const actionsNum = useMemo(
        () => BigNutils(appOverview?.actionsRewarded ?? 0).toCompactString(locale),
        [locale, appOverview],
    )

    const leftIcon = useMemo(() => {
        return isFavorite ? (
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
    }, [isFavorite, theme.isDark, styles.favIcon])

    useEffect(() => {
        const handleBackButton = () => {
            animateClose()
            return true
        }

        BackHandler.addEventListener("hardwareBackPress", handleBackButton)
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButton)
        }
    }, [animateClose])

    return (
        <BaseBottomSheet
            ref={ref}
            blurBackdrop
            dynamicHeight
            backgroundStyle={styles.backgroundStyle}
            enablePanDownToClose={false}
            onPressOutside="none"
            noMargins
            floating>
            <BaseView testID="VBD_CAROUSEL_BS" style={styles.root}>
                {bannerUri ? (
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
                ) : null}

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
                                    testID="VBD_CAROUSEL_BS_APP_NAME">
                                    {app?.name}
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
                            testID="VBD_CAROUSEL_BS_APP_DESCRIPTION">
                            {app?.description}
                        </BaseText>
                    </BaseView>
                </BlurView>
            </BaseView>

            <BaseView style={styles.infoContainer} bg={theme.colors.actionBottomSheet.background}>
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
                        leftIcon={leftIcon}
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            position: "relative",
            overflow: "hidden",
            height: 360,
            zIndex: 1,
            marginTop: -360,
        },
        backgroundStyle: {
            backgroundColor: theme.colors.actionBottomSheet.background,
        },
        heroWrapper: {
            width: "100%",
            height: "100%",
        },
        hero: {
            height: "100%",
            width: "100%",
        },
        infoContainer: {
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            paddingBottom: 12,
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
