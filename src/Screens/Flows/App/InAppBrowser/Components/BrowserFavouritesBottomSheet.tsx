import React, { useCallback, useMemo, useState } from "react"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useI18nContext } from "~i18n"
import { addBookmark, selectBookmarks, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useTheme } from "~Hooks"
import { BookmarksList } from "./BookmarksList"
import { EmptyBookmarks } from "./EmptyBookmarks"

type Props = {
    onClose: () => void
}

export const BrowserFavouritesBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { navigationState } = useInAppBrowser()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const theme = useTheme()
    const bookmarks = useAppSelector(selectBookmarks)

    const snapPoints = useMemo(() => {
        return ["50%", "75%", "90%"]
    }, [])

    const [snapIndex, setSnapIndex] = useState<number>(0)

    const handleSheetChanges = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const handleAddBookmark = () => {
        if (!navigationState?.url) return

        dispatch(addBookmark(navigationState.url))

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
