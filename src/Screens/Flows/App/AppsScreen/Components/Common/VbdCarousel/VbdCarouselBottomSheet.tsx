import React, { useCallback, useEffect } from "react"
import { ImageBackground, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView, BlurView } from "~Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { VbdDApp } from "~Model"

import { AVAILABLE_CATEGORIES, CategoryChip } from "../CategoryChip"
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { addBookmark, removeBookmark, selectFavoritesDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { useDAppActions } from "~Screens/Flows/App/DiscoverScreen/Hooks"

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
    translateY: -50,
    opacity: 0,
}

export const VbdCarouselBottomSheet = ({
    isOpen,
    setIsOpen,
    bannerUri,
    iconUri,
    category,
    app,
}: VbdCarouselBottomSheetProps) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const opacity = useSharedValue(ANIMATION_DEFAULT.opacity)
    const translateY = useSharedValue(ANIMATION_DEFAULT.translateY)
    const favorites = useAppSelector(selectFavoritesDapps)
    const dispatch = useAppDispatch()
    const { onDAppPress } = useDAppActions()

    const isFavorite = favorites.some(favorite => URIUtils.compareURLs(favorite.href, app.external_url))

    const handleClose = useCallback(() => {
        opacity.value = withTiming(ANIMATION_DEFAULT.opacity, { duration: 100 }, () => {
            translateY.value = withTiming(ANIMATION_DEFAULT.translateY)
            runOnJS(onClose)()
            runOnJS(setIsOpen)(false)
        })
    }, [onClose, opacity, setIsOpen, translateY])

    const onToggleFavorite = useCallback(() => {
        if (!isFavorite) {
            return dispatch(addBookmark(app))
        } else {
            dispatch(removeBookmark({ href: app.external_url }))
        }
    }, [app, dispatch, isFavorite])

    const onOpenApp = useCallback(() => {
        onDAppPress(app)
        handleClose()
    }, [app, onDAppPress, handleClose])

    useEffect(() => {
        if (isOpen) {
            opacity.value = withTiming(1, { duration: ANIMATION_DEFAULT.timing })
            translateY.value = withTiming(0, { duration: ANIMATION_DEFAULT.timing })
            onOpen()
        } else {
            handleClose()
        }
    }, [isOpen, onOpen, onClose, opacity, handleClose, translateY])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        }
    }, [opacity, translateY])

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
                    <ImageBackground source={{ uri: bannerUri }} style={styles.hero}>
                        <BaseIcon
                            style={styles.closeBtn}
                            size={36}
                            name="icon-x"
                            action={handleClose}
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
                            flexDirection="row"
                            py={5}
                            testID="VBD_CAROUSEL_ITEM_APP_DESCRIPTION">
                            {app.description}
                        </BaseText>
                    </BaseView>
                </BlurView>
            </BaseView>
            <BaseView px={24} pt={16} pb={24} gap={12}>
                <BaseButton
                    testID="Favorite_Button"
                    style={styles.btn}
                    leftIcon={
                        isFavorite ? (
                            <BaseIcon
                                style={styles.favIcon}
                                size={20}
                                name="icon-star-on"
                                testID="bottom-sheet-close-btn"
                            />
                        ) : (
                            <BaseIcon
                                style={styles.favIcon}
                                size={20}
                                name="icon-star"
                                testID="bottom-sheet-close-btn"
                            />
                        )
                    }
                    action={onToggleFavorite}
                    title={isFavorite ? LL.APPS_BS_BTN_REMOVE_FAVORITE() : LL.APPS_BS_BTN_ADD_FAVORITE()}
                    variant="outline"
                />
                <BaseButton
                    testID="Open_Button"
                    style={styles.btn}
                    action={onOpenApp}
                    title={LL.APPS_BS_BTN_OPEN_APP()}
                />
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
        marginTop: -10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
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
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
})
