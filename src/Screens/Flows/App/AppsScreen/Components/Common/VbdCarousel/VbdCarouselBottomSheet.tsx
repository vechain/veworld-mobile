import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { ElementType, useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
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
import { FastImageBackground } from "~Components/Reusable/FastImageBackground"
import { COLORS, ColorThemeType, isSmallScreen } from "~Constants"
import { useAppOverview, useBottomSheetModal, useDappBookmarking, useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdDApp } from "~Model"
import { Routes } from "~Navigation"
import { addBookmark, removeBookmark, useAppDispatch } from "~Storage/Redux"
import { BigNutils, DateUtils } from "~Utils"
import { useDAppActions } from "../../../Hooks"
import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"

export type VbdCarouselBottomSheetMetadata = {
    bannerUri?: string
    iconUri?: string
    category?: (typeof AVAILABLE_CATEGORIES)[number]
    app: VbdDApp
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

const VbdCarouselBottomSheetContent = ({
    app,
    bannerUri,
    category,
    iconUri,
    onClose,
}: VbdCarouselBottomSheetMetadata & { onClose: () => void }) => {
    const { LL, locale } = useI18nContext()
    const theme = useTheme()
    const { styles } = useThemedStyles(baseStyles)

    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions(Routes.APPS)
    const { data: appOverview, isLoading } = useAppOverview(app.id)

    const { isBookMarked } = useDappBookmarking(app?.external_url, app.name)

    const onToggleFavorite = useCallback(() => {
        if (!isBookMarked && app) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app?.external_url ?? "" }))
        }
    }, [app, dispatch, isBookMarked])

    const onOpenApp = useCallback(() => {
        onClose()
        onDAppPress(app)
    }, [app, onClose, onDAppPress])

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
        <>
            {bannerUri ? (
                <FastImageBackground source={{ uri: bannerUri }} style={styles.root} testID="VBD_CAROUSEL_BS">
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
                </FastImageBackground>
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
            dynamicHeight
            backgroundStyle={styles.backgroundStyle}
            enablePanDownToClose={false}
            noMargins
            floating>
            {data => <VbdCarouselBottomSheetContent {...data} onClose={onCloseBS} />}
        </BaseBottomSheet>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            height: isSmallScreen ? 320 : 360,
            position: "relative",
            overflow: "hidden",
            justifyContent: "flex-end",
        },
        blurView: {
            backgroundColor: "rgba(0, 0, 0, 0.30)",
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
        },
    })
