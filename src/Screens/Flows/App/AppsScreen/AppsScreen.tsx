import React from "react"
import { BaseButton, BaseView, Layout } from "~Components"
import { useBottomSheetModal } from "~Hooks"
import { FavoritesBottomSheet } from "./Components/FavoritesBottomSheet"

export const AppsScreen = () => {
    const { ref: favoritesRef, onOpen: onOpenFavorites, onClose: onCloseFavorites } = useBottomSheetModal()

    return (
        <Layout
            title="Apps"
            hasTopSafeAreaOnly
            fixedBody={
                <BaseView flex={1} p={16} gap={16}>
                    <BaseButton title="Open Favorites" action={onOpenFavorites} w={100} haptics="Medium" />

                    <FavoritesBottomSheet ref={favoritesRef} onClose={onCloseFavorites} />
                </BaseView>
            }
        />
    )
}
