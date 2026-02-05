import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { SkSize } from "@shopify/react-native-skia"
import React, { ElementType, useCallback, useEffect, useMemo, useState } from "react"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import { getTimeZone } from "react-native-localize"
import Animated, { FadeIn, FadeOut, useAnimatedRef } from "react-native-reanimated"
import { BadgeCheckIconSVG } from "~Assets/IconComponents/BadgeCheckIconSVG"
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
    DAppIcon,
} from "~Components"
import { EdgeSwipeIndicator, useEdgeSwipeGesture } from "~Components/Reusable/EdgeSwipeIndicator"
import { FastImageBackground } from "~Components/Reusable/FastImageBackground"
import { COLORS, ColorThemeType, isSmallScreen } from "~Constants"
import { useBottomSheetModal, useDappBookmarkToggle, useTheme, useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"
import { useAppOverview } from "~Hooks/useAppOverview"
import { useI18nContext } from "~i18n"
import { VbdDApp } from "~Model"
import { Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { addBookmark, removeBookmark, useAppDispatch } from "~Storage/Redux"
import { BigNutils, DateUtils, URIUtils } from "~Utils"
import { useDAppActions } from "../../../Hooks"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

export type VbdCarouselBottomSheetMetadata = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app: VbdDApp
    carouselIndex: number
    carouselDapps: VbdDApp[]
}

type VbdCarouselBottomSheetProps = {
    bsRef: React.RefObject<BottomSheetModalMethods>
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
    const color = useMemo(() => (theme.isDark ? COLORS.LIME_GREEN : COLORS.DARK_PURPLE_DISABLED), [theme.isDark])
    const titleColor = useMemo(() => (theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500), [theme.isDark])
    const descriptionColor = useMemo(() => (theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700), [theme.isDark])

    return (
        <BaseView justifyContent="center" alignItems="center" w={33.33}>
            <Icon fill={color} color={color} size={20} />
            <BaseText typographyFont="captionMedium" mt={8} mb={4} color={titleColor}>
                {title}
            </BaseText>
            {isLoading ? (
                <BaseSkeleton
                    animationDirection="horizontalLeft"
                    boneColor={theme.colors.skeletonBoneColor}
                    highlightColor={theme.colors.skeletonHighlightColor}
                    width={"50%"}
                    height={20}
                />
            ) : (
                <BaseText typographyFont="bodySemiBold" color={descriptionColor}>
                    {description}
                </BaseText>
            )}
        </BaseView>
    )
}

const UsersIcon = (props: Partial<BaseIconProps>) => <BaseIcon name="icon-users" {...props} />
const LeafIcon = (props: Partial<BaseIconProps>) => <BaseIcon name="icon-leaf" {...props} />

const VbdCarouselBottomSheetContent = ({
    app,
    carouselIndex,
    carouselDapps,
    onClose,
}: VbdCarouselBottomSheetMetadata & { onClose: () => void }) => {
    const [selectedApp, setSelectedApp] = useState<VbdDApp>(app)
    const [selectedAppIndex, setSelectedAppIndex] = useState<number>(carouselIndex)
    const [canvasSize, setCanvasSize] = useState<SkSize>({ width: 0, height: 0 })
    const backgroundRef = useAnimatedRef<View>()

    const { LL, locale } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const { data: appOverview, isLoading } = useAppOverview(selectedApp.id)

    const onSwipeLeft = useCallback(() => {
        if (selectedAppIndex === carouselDapps.length - 1) return

        HapticsService.triggerHaptics({ haptics: "Success" })

        setSelectedApp(carouselDapps[selectedAppIndex + 1])
        setSelectedAppIndex(selectedAppIndex + 1)
    }, [selectedAppIndex, carouselDapps])

    const onSwipeRight = useCallback(() => {
        if (selectedAppIndex === 0) return

        HapticsService.triggerHaptics({ haptics: "Success" })

        setSelectedApp(carouselDapps[selectedAppIndex - 1])
        setSelectedAppIndex(selectedAppIndex - 1)
    }, [selectedAppIndex, carouselDapps])

    const { swipeDirection, leftPatch, rightPatch, swipeGesture, viewImage, takeViewSnapshot } = useEdgeSwipeGesture({
        viewRef: backgroundRef,
        canvasSize,
        onSwipeLeft,
        onSwipeRight,
    })

    const bannerUri = useMemo(() => {
        const uri = selectedApp.ve_world?.featured_image ?? selectedApp.ve_world?.banner
        return uri ? URIUtils.convertUriToUrl(uri) : undefined
    }, [selectedApp])

    const iconUri = useAppLogo({ app: selectedApp, size: 24 })

    const category = useMemo(() => {
        return selectedApp.categories?.find(cat => AVAILABLE_CATEGORIES.includes(cat as any)) as
            | (typeof AVAILABLE_CATEGORIES)[number]
            | undefined
    }, [selectedApp.categories])

    const { isBookMarked } = useDappBookmarkToggle(selectedApp?.external_url, selectedApp.name)

    const onToggleFavorite = useCallback(() => {
        if (!isBookMarked && selectedApp) {
            return dispatch(addBookmark(selectedApp))
        } else {
            dispatch(removeBookmark({ href: selectedApp?.external_url ?? "" }))
        }
    }, [selectedApp, dispatch, isBookMarked])

    const onOpenApp = useCallback(() => {
        onClose()
        onDAppPress(selectedApp)
    }, [selectedApp, onClose, onDAppPress])

    const date = useMemo(
        () =>
            DateUtils.formatDateTime(
                Number(selectedApp?.createdAtTimestamp) * 1000,
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                { hideTime: true, hideDay: true },
            ),
        [selectedApp?.createdAtTimestamp, locale],
    )

    const usersNum = useMemo(
        () => BigNutils(appOverview?.totalUniqueUserInteractions ?? 0).toCompactString(locale),
        [appOverview, locale],
    )
    const actionsNum = useMemo(
        () => BigNutils(appOverview?.actionsRewarded ?? 0).toCompactString(locale),
        [appOverview, locale],
    )

    const leftIcon = useMemo(() => {
        return isBookMarked ? (
            <BaseIcon
                style={styles.favIcon}
                color={theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE}
                size={20}
                name="icon-star-on"
                testID="bottom-sheet-remove-favorite-icon"
            />
        ) : (
            <BaseIcon
                style={styles.favIcon}
                color={theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600}
                size={20}
                name="icon-star"
                testID="bottom-sheet-add-favorite-icon"
            />
        )
    }, [isBookMarked, theme.isDark, styles.favIcon])

    const favButtonStyles = useMemo(() => {
        if (isBookMarked) {
            return {
                textColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
                borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            }
        }
        return {
            textColor: theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
        }
    }, [isBookMarked, theme.isDark])

    useEffect(() => {
        if (bannerUri && backgroundRef.current) {
            takeViewSnapshot()
        }
    }, [bannerUri, backgroundRef, takeViewSnapshot])

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            setCanvasSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })
        },
        [setCanvasSize],
    )

    return (
        <>
            {bannerUri ? (
                <GestureDetector gesture={swipeGesture}>
                    <Animated.View
                        testID="VBD_CAROUSEL_BS"
                        onLayout={onLayout}
                        key={selectedApp.id}
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={styles.wrapper}>
                        <FastImageBackground
                            ref={backgroundRef}
                            source={{ uri: bannerUri }}
                            style={styles.root}
                            collapsable={false}>
                            <BaseIcon
                                style={styles.closeBtn}
                                color={COLORS.WHITE}
                                size={22}
                                name="icon-x"
                                action={onClose}
                                testID="bottom-sheet-close-btn"
                            />
                            <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={18}>
                                <BaseView flexDirection="column" gap={16} px={24} py={16}>
                                    <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                                        <BaseView flexDirection="row" alignItems="center" flex={1}>
                                            <DAppIcon size={24} uri={iconUri} />
                                            <BaseSpacer width={12} flexShrink={0} />
                                            <BaseText
                                                numberOfLines={1}
                                                typographyFont="subSubTitleSemiBold"
                                                color={COLORS.GREY_50}
                                                testID="VBD_CAROUSEL_BS_APP_NAME"
                                                flexDirection="row"
                                                flex={1}>
                                                {selectedApp?.name}
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
                                        numberOfLines={5}
                                        flexDirection="row"
                                        testID="VBD_CAROUSEL_BS_APP_DESCRIPTION">
                                        {selectedApp?.description}
                                    </BaseText>
                                </BaseView>
                            </BlurView>

                            <EdgeSwipeIndicator
                                canvasSize={canvasSize}
                                swipeDirection={swipeDirection}
                                viewImage={viewImage}
                                leftPatch={leftPatch}
                                rightPatch={rightPatch}
                            />
                        </FastImageBackground>
                    </Animated.View>
                </GestureDetector>
            ) : null}

            <BaseView style={styles.infoContainer} bg={theme.colors.actionBottomSheet.background}>
                <BaseView flexDirection="row" alignItems="center" justifyContent="center" gap={8} py={8}>
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

                <BaseView pt={24} gap={16} flexDirection="row">
                    <BaseButton
                        flex={1}
                        testID="Favorite_Button"
                        style={styles.btn}
                        leftIcon={leftIcon}
                        action={onToggleFavorite}
                        title={isBookMarked ? LL.BTN_FAVORiTED() : LL.BTN_FAVORITE()}
                        variant="outline"
                        {...favButtonStyles}
                    />
                    <BaseButton
                        flex={1}
                        testID="Open_Button"
                        style={styles.btn}
                        action={onOpenApp}
                        title={LL.APPS_BS_BTN_OPEN_APP()}
                    />
                </BaseView>
            </BaseView>
        </>
    )
}

export const VbdCarouselBottomSheet = ({ bsRef }: VbdCarouselBottomSheetProps) => {
    const { styles } = useThemedStyles(baseStyles)
    const { ref, onClose: onCloseBS } = useBottomSheetModal({
        externalRef: bsRef,
    })

    return (
        <BaseBottomSheet<VbdCarouselBottomSheetMetadata>
            ref={ref}
            backgroundStyle={styles.backgroundStyle}
            enablePanDownToClose={false}
            dynamicHeight
            scrollable={false}
            noMargins
            floating>
            {data => <VbdCarouselBottomSheetContent {...data} onClose={onCloseBS} />}
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        wrapper: {
            position: "relative",
        },
        canvas: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
        },
        root: {
            height: isSmallScreen ? 320 : 360,
            position: "relative",

            justifyContent: "flex-end",
        },
        blurView: {
            backgroundColor: "rgba(0, 0, 0, 0.30)",
        },
        backgroundStyle: {
            backgroundColor: theme.colors.actionBottomSheet.background,
        },

        infoContainer: {
            paddingBottom: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
        },
        btn: {
            justifyContent: "center",
            height: 48,
        },
        favIcon: {
            marginRight: 12,
            marginVertical: -2,
        },
        closeBtn: {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0, 0, 0, 0.50)",
            borderRadius: 100,
            padding: 10,
            zIndex: 3,
        },
    })
