import { useMemo } from "react"
import { DiscoveryDApp } from "~Constants"
import { useVeBetterDaoDapps } from "~Hooks/useFetchFeaturedDApps"
import { VeBetterDaoDAppMetadata } from "~Model"
import { DAppUtils } from "~Utils"

type UseAppLogoArgs = {
    app: VeBetterDaoDAppMetadata | DiscoveryDApp
    /**
     * Size of the favicon, if there's no logo
     * @default 64
     */
    size?: number
}

export const useAppLogo = ({ app, size = 64 }: UseAppLogoArgs) => {
    const { data: vbdApps } = useVeBetterDaoDapps()

    return useMemo(() => {
        if ("external_url" in app) {
            //It's a VBD app
            return app.logo
        }
        if (app.veBetterDaoId) {
            const foundVbdApp = vbdApps?.find(vbd => vbd.id === app.veBetterDaoId)
            if (foundVbdApp) return foundVbdApp.logo
        }
        if (app.id) return DAppUtils.getAppHubIconUrl(app.id)
        return DAppUtils.generateFaviconUrl(app.href, { size })
    }, [app, size, vbdApps])
}
