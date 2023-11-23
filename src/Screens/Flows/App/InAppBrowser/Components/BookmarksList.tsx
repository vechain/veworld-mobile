import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { useScrollableList, useTheme } from "~Hooks"
import React, { useCallback } from "react"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { StyleSheet } from "react-native"
import { CompatibleDApp } from "~Constants"

type IBookmarksList = {
    bookmarks: CompatibleDApp[]
    onClose: () => void
    snapPoints: string[]
    snapIndex: number
}

export const BookmarksList = ({ bookmarks, onClose, snapPoints, snapIndex }: IBookmarksList) => {
    const { navigateToUrl } = useInAppBrowser()
    const theme = useTheme()

    const onPressBookmark = (bookmark: CompatibleDApp) => {
        navigateToUrl(bookmark.href)
        onClose()
    }

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } = useScrollableList(
        bookmarks,
        snapIndex,
        snapPoints.length,
    )

    const languagesListSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <BaseView flexDirection="row" style={baseStyles.list}>
            <BottomSheetFlatList
                data={bookmarks}
                keyExtractor={bookmark => bookmark.id}
                ItemSeparatorComponent={languagesListSeparator}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => {
                    return (
                        <BaseTouchableBox
                            haptics="Light"
                            action={() => onPressBookmark(item)}
                            containerStyle={baseStyles.languageContainer}
                            innerContainerStyle={{
                                backgroundColor: theme.colors.card,
                            }}>
                            <BaseText color={theme.colors.text}>{item.name}</BaseText>
                        </BaseTouchableBox>
                    )
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={isListScrollable}
            />
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    languageContainer: {
        paddingHorizontal: 10,
    },
    list: {
        height: "90%",
    },
})
