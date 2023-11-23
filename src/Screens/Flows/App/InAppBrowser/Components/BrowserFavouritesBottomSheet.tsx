import React, { useCallback, useMemo, useState } from "react"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { addBookmark, selectBookmarkedDapps, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useTheme } from "~Hooks"
import { BookmarksList } from "./BookmarksList"
import { EmptyBookmarks } from "./EmptyBookmarks"
import { CompatibleDApp } from "~Constants"

type Props = {
    onClose: () => void
}

export const BrowserFavouritesBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { navigationState } = useInAppBrowser()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const theme = useTheme()
    const bookmarks = useAppSelector(selectBookmarkedDapps)

    const snapPoints = useMemo(() => {
        return ["50%", "75%", "90%"]
    }, [])

    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChanges = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const handleAddBookmark = () => {
        if (!navigationState?.url) return

        const url = new URL(navigationState.url)

        const compatibleDapp: CompatibleDApp = {
            href: navigationState.url,
            name: url.host,
            image: `http://${url.host}/favicon.ico`,
            isCustom: true,
            createAt: new Date().getTime(),
            id: url.href,
            amountOfNavigations: 1,
        }

        dispatch(addBookmark(compatibleDapp))

        onClose()
    }

    return (
        <BaseBottomSheet snapPoints={snapPoints} onChange={handleSheetChanges} ref={ref}>
            <BaseView w={100} h={100} flexGrow={1} justifyContent="space-between">
                <BaseView>
                    <BaseView w={100} alignItems="center">
                        <BaseView flexDirection="row" justifyContent="space-between" w={100}>
                            <BaseText typographyFont="subTitleBold">{LL.BROWSER_FAVOURITES_TITLE()}</BaseText>
                            {bookmarks.length > 0 && (
                                <BaseView flexDirection="row">
                                    <BaseIcon
                                        size={24}
                                        name="plus"
                                        bg={theme.colors.secondary}
                                        action={handleAddBookmark}
                                    />
                                </BaseView>
                            )}
                        </BaseView>

                        <BaseSpacer height={40} />

                        {bookmarks.length > 0 ? (
                            <BookmarksList
                                bookmarks={bookmarks}
                                onClose={onClose}
                                snapPoints={snapPoints}
                                snapIndex={snapIndex}
                            />
                        ) : (
                            <EmptyBookmarks onClose={onClose} />
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})
