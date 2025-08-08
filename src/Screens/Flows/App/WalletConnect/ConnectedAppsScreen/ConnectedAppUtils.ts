import { ConnectedDiscoveryApp } from "~Storage/Redux"
import { ConnectedApp } from "./ConnectedAppsScreen"
import { DiscoveryDApp } from "~Constants"

export const mapConnectedApps = (apps: ConnectedDiscoveryApp[], appHubDapps: DiscoveryDApp[]): ConnectedApp[] => {
    return apps.map(sourceDapp => {
        const foundDapp = appHubDapps.find(dapp => new URL(dapp.href).hostname === sourceDapp.href)
        if (foundDapp) return { type: "in-app", app: foundDapp }
        return {
            type: "in-app",
            app: {
                name: sourceDapp.name,
                href: `https://${sourceDapp.href}`,
                desc: `https://${sourceDapp.href}`,
                isCustom: true,
                createAt: Date.now(),
                amountOfNavigations: 1,
            },
        }
    })
}
