import { useI18nContext } from "~i18n"
import { addBookmark, useAppDispatch } from "~Storage/Redux"
import { useInAppBrowser } from "~Components/Providers/InAppBrowserProvider"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { COLORS, DiscoveryDApp } from "~Constants"
import { StyleSheet } from "react-native"
import React from "react"
import { URIUtils } from "~Utils"

type EmptyBookmarksProps = {
    onClose: () => void
}

export const EmptyBookmarks = ({ onClose }: EmptyBookmarksProps) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { navigationState } = useInAppBrowser()

    const handleAddBookmark = () => {
        if (!navigationState?.url) return

        const url = new URL(navigationState.url)

        const compatibleDapp: DiscoveryDApp = {
            href: URIUtils.clean(navigationState.url),
            name: url.host,
            image: `http://${url.host}/favicon.ico`,
            isCustom: true,
            createAt: new Date().getTime(),
            amountOfNavigations: 1,
        }

        dispatch(addBookmark(compatibleDapp))

        onClose()
    }

    return (
        <BaseView mx={20} justifyContent="center" alignItems="center">
            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                <BaseTouchable action={handleAddBookmark}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={emptyListStyles.quickActions}>
                        <BaseIcon name="plus" size={55} />
                        <BaseText color={COLORS.DARK_PURPLE} typographyFont="bodyMedium">
                            {LL.BROWSER_ADD_BOOKMARK_TITLE()}
                        </BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseText mx={20} typographyFont="body" align="center">
                {LL.BROWSER_ADD_BOOKMARK_DESCRIPTION()}
            </BaseText>
        </BaseView>
    )
}

const emptyListStyles = StyleSheet.create({
    quickActions: {
        width: 140,
        height: 100,
    },
})
