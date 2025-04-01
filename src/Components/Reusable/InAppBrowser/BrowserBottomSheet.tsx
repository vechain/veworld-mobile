import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useMemo } from "react"
import { BaseBottomSheet, BaseView } from "~Components/Base"
import { useInAppBrowser } from "~Components/Providers"
import { useCopyClipboard, useDappBookmarking } from "~Hooks"
import { useI18nContext } from "~i18n"
import { IconKey } from "~Model"

type Props = {
    onClose: () => void
}

type BottomSheetAction = {
    icon: IconKey
    label: string
    onPress: () => void
}

export const BrowserBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>((props, ref) => {
    const { LL } = useI18nContext()
    const { isDapp, navigationState } = useInAppBrowser()
    const { isBookMarked, toggleBookmark } = useDappBookmarking(navigationState?.url)
    const { onCopyToClipboard } = useCopyClipboard()

    const actions: BottomSheetAction[] = useMemo(() => {
        const favoriteItem = isBookMarked
            ? {
                  icon: "icon-star-on" as const,
                  label: LL.BROWSER_REMOVE_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }
            : {
                  icon: "icon-star-off" as const,
                  label: LL.BROWSER_ADD_FAVORITE_DAPPS(),
                  onPress: toggleBookmark,
              }

        return [
            {
                icon: "icon-copy",
                label: LL.BROWSER_COPY_LINK(),
                onPress: () => onCopyToClipboard(navigationState?.url ?? "", LL.BROWSER_COPY_LINK_SUCCESS()),
            },
            {
                icon: "icon-share",
                label: LL.BROWSER_SHARE(),
                onPress: () => {},
            },
            ...(isDapp ? [favoriteItem] : []),
        ]
    }, [LL, isBookMarked, isDapp, navigationState?.url, onCopyToClipboard, toggleBookmark])

    return (
        <BaseBottomSheet dynamicHeight ref={ref}>
            {actions.map(() => (
                <BaseView />
            ))}
            <BaseView w={100} />
        </BaseBottomSheet>
    )
})
