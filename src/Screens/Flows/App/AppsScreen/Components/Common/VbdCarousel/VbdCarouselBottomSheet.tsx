import React, { ElementType, useCallback, useMemo } from "react"
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
import { COLORS, ColorThemeType } from "~Constants"
import { useAppOverview, useBottomSheetModal, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdDApp } from "~Model"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BadgeCheckIconSVG } from "~Assets/IconComponents/BadgeCheckIconSVG"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"
import { addBookmark, removeBookmark, useAppDispatch } from "~Storage/Redux"
import { BigNutils, DateUtils } from "~Utils"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

export type VbdCarouselBottomSheetMetadata = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app?: VbdDApp
}

type VbdCarouselBottomSheetProps = {
    bsRef: React.RefObject<BottomSheetModalMethods>
    onClose: () => void
} & VbdCarouselBottomSheetMetadata

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

export const VbdCarouselBottomSheet = ({
    bsRef,
    bannerUri,
    iconUri,
    category,
    app,
    onClose,
}: VbdCarouselBottomSheetProps) => {
    const { LL, locale } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)
    const { ref, onClose: onCloseBS } = useBottomSheetModal({
        externalRef: bsRef,
    })

    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions()
    const { data: appOverview, isLoading } = useAppOverview(app?.id)

    const { isBookMarked } = useDappBookmarking(app?.external_url, app?.name)

    const handleClose = useCallback(() => {
        onClose()
        onCloseBS()
    }, [onClose, onCloseBS])

    const onToggleFavorite = useCallback(() => {
        if (!isBookMarked && app) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app?.external_url ?? "" }))
        }
    }, [app, dispatch, isBookMarked])

    const onOpenApp = useCallback(() => {
        if (app) {
            handleClose()
            onDAppPress(app)
        }
    }, [app, handleClose, onDAppPress])

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

    return (
        <BaseBottomSheet
            ref={ref}
            dynamicHeight
            backgroundStyle={styles.backgroundStyle}
            onDismiss={handleClose}
            enablePanDownToClose={false}
            noMargins
            floating>
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
                                numberOfLines={5}
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
                        title={isBookMarked ? LL.APPS_BS_BTN_REMOVE_FAVORITE() : LL.APPS_BS_BTN_ADD_FAVORITE()}
                        variant="outline"
                        {...favButtonStyles}
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
