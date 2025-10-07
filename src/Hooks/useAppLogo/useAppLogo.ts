import { useMemo } from "react"
import { DiscoveryDApp } from "~Constants"
import { VeBetterDaoDAppMetadata } from "~Model"
import { useDynamicAppLogo } from "./useDynamicAppLogo"

type UseAppLogoArgs = {
    app: VeBetterDaoDAppMetadata | DiscoveryDApp | undefined
    /**
     * Size of the favicon, if there's no logo
     * @default 64
     */
    size?: number
}

export const useAppLogo = ({ app, size = 64 }: UseAppLogoArgs) => {
    const fetchLogo = useDynamicAppLogo({ size })

    return useMemo(() => fetchLogo({ app }), [app, fetchLogo])
}
