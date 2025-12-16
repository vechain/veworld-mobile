import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useRef, useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseTouchable, BaseView, HeaderStyleV2, HeaderTitle, Layout } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useDappBookmarksList, useThemedStyles } from "~Hooks"
import { useIsNormalUser } from "~Hooks/useIsNormalUser"
import { useI18nContext } from "~i18n"
import { X2ECategoryType } from "~Model"
import { RootStackParamListApps, Routes } from "~Navigation"
import { EcosystemSection } from "./Components/Ecosystem"
import { FavoritesBottomSheet } from "./Components/FavoritesBottomSheet"
import { FavoritesSuggestionBanner } from "./Components/FavoritesSuggestionBanner"
import { FavouritesV2 } from "./Components/Favourites/FavouritesV2"
import { ForYouCarousel } from "./Components/ForYouCarousel/ForYouCarousel"
import { NewUserForYouCarousel } from "./Components/ForYouCarousel/NewUserForYouCarousel"
import { AppsBottomSheet, VeBetterSection } from "./Components/VeBetter"
import { VeBetterDAOCarousel } from "./Components/VeBetterDAOCarousel"
import { useDAppActions } from "./Hooks/useDAppActions"

export const AppsScreen = ({ route }: NativeStackScreenProps<RootStackParamListApps, Routes.APPS>) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const [selectedCategoryId, setSelectedCategoryId] = useState<X2ECategoryType | undefined>()

    const { ref: favoritesRef, onOpen: onOpenFavorites, onClose: onCloseFavorites } = useBottomSheetModal()
    const {
        ref: appsBottomSheetRef,
        onOpen: onOpenAppsBottomSheet,
        onClose: onCloseAppsBottomSheet,
    } = useBottomSheetModal()
    const layoutRef = useRef<ScrollView>(null)

    const bookmarkedDApps = useDappBookmarksList()
    const { onDAppPress } = useDAppActions(Routes.APPS)

    const showFavorites = bookmarkedDApps.length > 0

    const isNormalUser = useIsNormalUser()

    const goToSearch = useCallback(() => {
        nav.navigate(Routes.APPS_SEARCH)
    }, [nav])

    const handleCategoryPress = useCallback(
        (categoryId: X2ECategoryType) => {
            setSelectedCategoryId(categoryId)
            onOpenAppsBottomSheet()
        },
        [onOpenAppsBottomSheet],
    )

    const handleCloseAppsBottomSheet = useCallback(() => {
        onCloseAppsBottomSheet()
        setSelectedCategoryId(undefined)
    }, [onCloseAppsBottomSheet])

    const handleFavoritesSuggestionPress = useCallback(() => {
        setSelectedCategoryId(X2ECategoryType.NUTRITION)
        onOpenAppsBottomSheet()
    }, [onOpenAppsBottomSheet])

    return (
        <Layout
            bg={theme.colors.background}
            noBackButton
            noMargin
            scrollViewRef={layoutRef}
            fixedHeader={
                <BaseView style={[HeaderStyleV2, styles.header]}>
                    <HeaderTitle
                        title={LL.APPS_SCREEN_TITLE()}
                        leftIconName="icon-apps"
                        testID="AppsScreen_HeaderTitle"
                        typographyFont="headerTitle"
                        align="left"
                    />
                    <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                        <BaseSpacer width={8} />
                        <BaseTouchable
                            action={goToSearch}
                            haptics="Light"
                            testID="AppsScreen_SearchButton"
                            style={styles.iconContainer}>
                            <BaseIcon name={"icon-search"} size={16} color={theme.colors.text} />
                        </BaseTouchable>
                    </BaseView>
                </BaseView>
            }
            body={
                <>
                    <BaseSpacer height={24} />

                    {showFavorites && (
                        <>
                            <FavouritesV2
                                bookmarkedDApps={bookmarkedDApps}
                                onActionLabelPress={onOpenFavorites}
                                onDAppPress={onDAppPress}
                            />
                            <BaseSpacer height={40} />
                        </>
                    )}
                    {isNormalUser ? <ForYouCarousel /> : <NewUserForYouCarousel />}

                    <BaseSpacer height={48} />

                    <VeBetterSection onPressCategory={handleCategoryPress} />
                    <BaseSpacer height={48} />

                    {!showFavorites && (
                        <>
                            <FavoritesSuggestionBanner onPress={handleFavoritesSuggestionPress} />
                            <BaseSpacer height={48} />
                        </>
                    )}

                    {isNormalUser && (
                        <>
                            <VeBetterDAOCarousel />
                            <BaseSpacer height={48} />
                        </>
                    )}

                    <EcosystemSection defaultFilter={route.params?.filter} scrollViewRef={layoutRef} />
                    <FavoritesBottomSheet ref={favoritesRef} onClose={onCloseFavorites} />
                    <AppsBottomSheet
                        ref={appsBottomSheetRef}
                        onDismiss={handleCloseAppsBottomSheet}
                        initialCategoryId={selectedCategoryId}
                    />
                </>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            padding: 8,
            borderRadius: 100,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.GREY_100,
        },
        header: {
            paddingHorizontal: 16,
        },
    })
