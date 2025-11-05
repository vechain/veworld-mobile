import { useMemo } from "react"
import { DiscoveryDApp } from "~Constants"
import { useVeBetterDaoDapps } from "~Hooks"
import {
    selectCustomDapps,
    selectFavoriteRefs,
    selectFavoritesDapps,
    selectFeaturedDapps,
    useAppSelector,
} from "~Storage/Redux"
import uniqBy from "lodash/uniqBy"
import { resolveDAppsFromReferences } from "~Utils/DAppUtils/DAppBookmarkResolver"

export const useDappBookmarksList = (): DiscoveryDApp[] => {
    const favoriteRefs = useAppSelector(selectFavoriteRefs)
    const featuredDapps = useAppSelector(selectFeaturedDapps)
    const customDapps = useAppSelector(selectCustomDapps)
    const oldFavorites = useAppSelector(selectFavoritesDapps)
    const { data: vbdDapps = [] } = useVeBetterDaoDapps()

    return useMemo(() => {
        // Fallback for pre-migration users
        if (!favoriteRefs || favoriteRefs.length === 0) {
            const dapps: DiscoveryDApp[] = [...oldFavorites, ...customDapps]
            return uniqBy(dapps, value => value.href)
        }

        // Build lookup maps
        const byId = new Map(featuredDapps.filter(d => d.id).map(d => [d.id!, d]))

        // Convert VBD dApps to DiscoveryDApp format and create lookup map
        const byVbdId = new Map(
            vbdDapps.map(vbd => [
                vbd.id,
                {
                    href: vbd.external_url,
                    name: vbd.name,
                    desc: vbd.description,
                    iconUri: vbd.logo,
                    isCustom: false,
                    createAt: new Date(vbd.createdAtTimestamp).getTime(),
                    amountOfNavigations: 0,
                    veBetterDaoId: vbd.id,
                } as DiscoveryDApp,
            ]),
        )

        const resolved = resolveDAppsFromReferences(favoriteRefs, { byId, byVbdId })
        return uniqBy(resolved, value => value.href)
    }, [favoriteRefs, featuredDapps, vbdDapps, customDapps, oldFavorites])
}
