import React from "react"
import { ScrollView, StyleSheet } from "react-native"
import { BaseSpacer, BaseView, Layout } from "~Components"
import { useThemedStyles, useBottomSheetModal } from "~Hooks"
import { selectBookmarkedDapps, useAppSelector } from "~Storage/Redux"
import { Favourites } from "../DiscoverScreen/Components"

import { useDAppActions } from "../DiscoverScreen/Hooks"
import { FavoritesBottomSheet } from "../AppsScreen/Components/FavoritesBottomSheet"

export const AppsScreen: React.FC = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { ref: favoritesRef, onOpen: onOpenFavorites, onClose: onCloseFavorites } = useBottomSheetModal()

    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)
    const { onDAppPress } = useDAppActions()

    const showFavorites = bookmarkedDApps.length > 0

    return (
        <>
            <FavoritesBottomSheet ref={favoritesRef} onClose={onCloseFavorites} />
            <Layout
                noBackButton
                hasSafeArea
                fixedBody={
                    <BaseView style={styles.rootContainer}>
                        <ScrollView
                            style={styles.scrollView}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}>
                            <BaseSpacer height={24} />

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
                        </ScrollView>
                    </BaseView>
                }
            />
        </>
    )
}

export const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
        },
        scrollView: {
            flex: 1,
        },
        popUpContainer: {
            position: "absolute",
            bottom: -100,
            left: 0,
            right: 0,
            zIndex: 2,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
    })
