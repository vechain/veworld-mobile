import { useCallback } from "react"
import { DiscoveryDApp } from "~Constants"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VeBetterDaoDAppMetadata } from "~Model"
import { DAppUtils, URIUtils } from "~Utils"

type Args = {
    /**
     * Size of the favicon, if there's no logo
     * @default 64
     */
    size?: number
}

type FnArgs = {
    app: VeBetterDaoDAppMetadata | DiscoveryDApp
}

export const useDynamicAppLogo = ({ size = 64 }: Args) => {
    const { data: vbdApps } = useVeBetterDaoDapps()

    return useCallback(
        ({ app }: FnArgs) => {
            if ("external_url" in app) {
                //It's a VBD app
                return URIUtils.convertUriToUrl(app.logo)
            }
            if (app.veBetterDaoId) {
                const foundVbdApp = vbdApps?.find(vbd => vbd.id === app.veBetterDaoId)
                if (foundVbdApp) return URIUtils.convertUriToUrl(foundVbdApp.logo)
            }
            //IconURI takes precedence, since it could contain a cache bust query parameter that updates the cache on Android.
            if (app.iconUri) return app.iconUri
            if (app.id) return DAppUtils.getAppHubIconUrl(app.id)
            return DAppUtils.generateFaviconUrl(app.href, { size })
        },
        [size, vbdApps],
    )
}
