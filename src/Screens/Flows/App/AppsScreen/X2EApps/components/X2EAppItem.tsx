import React, { useCallback, useMemo } from "react"
import { useNavigation } from "@react-navigation/native"
import { AnalyticsEvent } from "~Constants"
import { useI18nContext } from "~i18n"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { useDappBookmarking, useAnalyticTracking } from "~Hooks"
import { Routes } from "~Navigation"
import { addNavigationToDApp, useAppDispatch } from "~Storage/Redux"
import { URIUtils } from "~Utils"
import { X2EAppWithDetails } from "./X2EAppWithDetails"
import { X2EAppDetails } from "./X2EAppDetails"
import { useX2ECategories } from "../hooks/useX2ECategories"

type X2EDapp = VeBetterDaoDapp & VeBetterDaoDAppMetadata

type X2EAppItemProps = {
    dapp: X2EDapp
    onDismiss?: () => void
    openItemId: string | null
    onToggleOpenItem: (itemId: string) => void
}

export const X2EAppItem = React.memo(({ dapp, onDismiss, openItemId, onToggleOpenItem }: X2EAppItemProps) => {
    const { isBookMarked, toggleBookmark } = useDappBookmarking(dapp.external_url, dapp.name)
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const logoUrl = useMemo(() => {
        return URIUtils.convertUriToUrl(dapp.logo)
    }, [dapp.logo])

    const handleOpen = useCallback(() => {
        track(AnalyticsEvent.DISCOVERY_USER_OPENED_DAPP, {
            url: dapp.external_url,
        })

        setTimeout(() => {
            dispatch(addNavigationToDApp({ href: dapp.external_url, isCustom: false }))
        }, 1000)

        nav.navigate(Routes.BROWSER, { url: dapp.external_url })
        onDismiss?.()
    }, [dapp.external_url, nav, track, dispatch, onDismiss])

    const allCategories = useX2ECategories()

    const categoryDisplayNames = useMemo(() => {
        if (!dapp.categories || dapp.categories.length === 0) {
            const othersCategory = allCategories.find(cat => cat.id === "others")
            return [othersCategory?.displayName ?? LL.APP_CATEGORY_OTHERS()]
        }

        return dapp.categories.map(categoryId => {
            const category = allCategories.find(cat => cat.id === categoryId)
            return category?.displayName ?? LL.APP_CATEGORY_OTHERS()
        })
    }, [dapp.categories, allCategories, LL])

    const isOpen = useMemo(() => openItemId === dapp.id, [openItemId, dapp.id])

    const detailsChildren = useMemo(
        () => (
            <X2EAppDetails.Container>
                <X2EAppDetails.Description>{dapp.description}</X2EAppDetails.Description>
                <X2EAppDetails.Stats />
                <X2EAppDetails.Actions
                    onAddToFavorites={toggleBookmark}
                    isFavorite={isBookMarked}
                    onOpen={handleOpen}
                />
            </X2EAppDetails.Container>
        ),
        [dapp.description, toggleBookmark, isBookMarked, handleOpen],
    )

    return (
        <X2EAppWithDetails
            name={dapp.name}
            icon={logoUrl}
            desc={dapp.description}
            categories={categoryDisplayNames}
            isFavorite={isBookMarked}
            onToggleFavorite={toggleBookmark}
            itemId={dapp.id}
            isOpen={isOpen}
            onToggleOpen={onToggleOpenItem}>
            {detailsChildren}
        </X2EAppWithDetails>
    )
})
