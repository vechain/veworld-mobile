import { useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseTouchable, BaseView, HeaderStyleV2, HeaderTitle, Layout } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useIsNormalUser } from "~Hooks/useIsNormalUser"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { EcosystemSection } from "./Components/Ecosystem"
import { ForYouCarousel } from "./Components/ForYouCarousel/ForYouCarousel"
import { NewUserForYouCarousel } from "./Components/ForYouCarousel/NewUserForYouCarousel"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectBookmarkedDapps } from "~Storage/Redux/Selectors"
import { useDAppActions } from "./Hooks/useDAppActions"
import { Favourites } from "../DiscoverScreen/Components/Favourites"
import { FavoritesBottomSheet } from "./Components/FavoritesBottomSheet"
import { FavoritesSuggestionBanner } from "./Components/FavoritesSuggestionBanner"

export const AppsScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { ref: favoritesRef, onOpen: onOpenFavorites, onClose: onCloseFavorites } = useBottomSheetModal()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const { onDAppPress } = useDAppActions()

    const showFavorites = bookmarkedDApps.length > 0

    const isNormalUser = useIsNormalUser()

    const goToSearch = useCallback(() => {
        nav.navigate(Routes.APPS_SEARCH)
    }, [nav])

    return (
        <Layout
            title={LL.APPS_TITLE()}
            hasTopSafeAreaOnly
            noBackButton
            noMargin
            fixedHeader={
                <BaseView style={[HeaderStyleV2, styles.header]}>
                    <HeaderTitle
                        title={LL.APPS_SCREEN_TITLE()}
                        leftIconName="icon-apps"
                        testID="AppsScreen_HeaderTitle"
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
                    {showFavorites && (
                        <>
                            <Favourites
                                bookmarkedDApps={bookmarkedDApps}
                                onActionLabelPress={onOpenFavorites}
                                onDAppPress={onDAppPress}
                            />
                            <BaseSpacer height={48} />
                        </>
                    )}
                    {isNormalUser ? <ForYouCarousel /> : <NewUserForYouCarousel />}

                    <BaseSpacer height={48} />

                    {!showFavorites && (
                        <>
                            <FavoritesSuggestionBanner onPress={() => {}} />
                            <BaseSpacer height={48} />
                        </>
                    )}

                    <EcosystemSection />
                    <FavoritesBottomSheet ref={favoritesRef} onClose={onCloseFavorites} />
                </>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        header: {
            paddingHorizontal: 16,
            marginBottom: 24,
        },
    })
