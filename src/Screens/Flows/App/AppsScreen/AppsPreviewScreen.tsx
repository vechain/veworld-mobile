import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { ElementType, useCallback, useMemo } from "react"
import { ImageBackground, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { getTimeZone } from "react-native-localize"
import Animated from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { BadgeCheckIconSVG } from "~Assets/IconComponents/BadgeCheckIconSVG"
import {
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
import { useAppOverview, useTheme, useThemedStyles } from "~Hooks"
import { useAppLogo } from "~Hooks/useAppLogo"
import { RootStackParamListApps, Routes } from "~Navigation"
import { addBookmark, removeBookmark, selectFavoritesDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { BigNutils, DateUtils, PlatformUtils, URIUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { AVAILABLE_CATEGORIES, CategoryChip } from "./Components/Common/CategoryChip"

type Props = NativeStackScreenProps<RootStackParamListApps, Routes.APPS_PREVIEW>

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

export const AppsPreviewScreen = ({ route, navigation }: Props) => {
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { bottom: bottomSafeAreaSize } = useSafeAreaInsets()

    const app = useMemo(() => route.params.app, [route.params.app])

    const favorites = useAppSelector(selectFavoritesDapps)
    const dispatch = useAppDispatch()

    const { data: appOverview, isLoading } = useAppOverview(app.id)

    const isFavorite = useMemo(
        () => favorites.some(favorite => URIUtils.compareURLs(favorite.href, app?.external_url)),
        [app?.external_url, favorites],
    )

    const onToggleFavorite = useCallback(() => {
        if (!isFavorite && app) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app?.external_url ?? "" }))
        }
    }, [app, dispatch, isFavorite])

    const bannerUri = useMemo(() => {
        const uri = route.params.app.ve_world?.featured_image ?? route.params.app.ve_world?.banner
        if (uri) return URIUtils.convertUriToUrl(uri)
        return uri
    }, [route.params.app.ve_world?.banner, route.params.app.ve_world?.featured_image])

    const appLogo = useAppLogo({ app })

    const category = useMemo(() => {
        return app.categories?.find(cat => AVAILABLE_CATEGORIES.includes(cat as any)) as
            | (typeof AVAILABLE_CATEGORIES)[number]
            | undefined
    }, [app.categories])

    const handleClose = useCallback(() => {
        navigation.goBack()
    }, [navigation])

    const favButtonStyles = useMemo(() => {
        if (isFavorite) {
            return {
                textColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
                borderColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            }
        }
        return {
            textColor: theme.isDark ? COLORS.GREY_50 : COLORS.GREY_600,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200,
        }
    }, [isFavorite, theme.isDark])

    const leftIcon = useMemo(() => {
        return isFavorite ? (
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
    }, [isFavorite, theme.isDark, styles.favIcon])

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

    return (
        <Animated.View
            style={[
                styles.rootContainer,
                { marginBottom: PlatformUtils.isAndroid() ? bottomSafeAreaSize + 32 : bottomSafeAreaSize },
            ]}
            sharedTransitionTag={`PREVIEW_IMAGE_${app.id}`}>
            {bannerUri ? (
                <ImageBackground source={{ uri: bannerUri }} style={styles.root} testID="VBD_CAROUSEL_BS">
                    <BaseIcon
                        style={styles.closeBtn}
                        color={COLORS.WHITE}
                        size={22}
                        name="icon-x"
                        action={handleClose}
                        testID="bottom-sheet-close-btn"
                    />
                    <BlurView style={styles.blurView} overlayColor="transparent" blurAmount={10}>
                        <BaseView flexDirection="column" gap={16} px={24} py={16}>
                            <BaseView flexDirection="row" alignItems="center" justifyContent="space-between">
                                <BaseView flexDirection="row" alignItems="center">
                                    <FastImage source={{ uri: appLogo }} style={styles.logo as ImageStyle} />
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
                                testID="VBD_CAROUSEL_BS_APP_DESCRIPTION">
                                {app?.description}
                            </BaseText>
                        </BaseView>
                    </BlurView>
                </ImageBackground>
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

                <BaseView pt={16} gap={12}>
                    <BaseButton
                        testID="Favorite_Button"
                        style={styles.btn}
                        leftIcon={leftIcon}
                        action={onToggleFavorite}
                        title={isFavorite ? LL.APPS_BS_BTN_REMOVE_FAVORITE() : LL.APPS_BS_BTN_ADD_FAVORITE()}
                        variant="outline"
                        {...favButtonStyles}
                    />
                    <BaseButton
                        testID="Open_Button"
                        style={styles.btn}
                        action={() => {}}
                        title={LL.APPS_BS_BTN_OPEN_APP()}
                    />
                </BaseView>
            </BaseView>
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContainer: {
            marginTop: "auto",
            marginHorizontal: 8,
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
        },
        root: {
            height: 360,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
        blurView: {
            backgroundColor: "rgba(0, 0, 0, 0.30)",
        },
        logo: {
            width: 32,
            height: 32,
            borderRadius: 4,
        },
        backgroundStyle: {
            backgroundColor: theme.colors.actionBottomSheet.background,
            overflow: "hidden",
        },

        infoContainer: {
            paddingBottom: 24,
            paddingHorizontal: 24,
            paddingTop: 16,
        },
        btn: {
            justifyContent: "center",
        },
        favIcon: {
            marginRight: 12,
            marginVertical: -2,
        },
        closeBtn: {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            borderRadius: 100,
            padding: 10,
        },
    })
