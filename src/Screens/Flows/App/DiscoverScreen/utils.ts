import { DiscoveryDApp } from "~Constants"
import { AppHubUrl } from "./constants"
import { URIUtils } from "~Utils"

export const getAppHubIconUrl = (appId: string) => {
    return `${AppHubUrl}/imgs/${appId}.png`
}

export const groupFavoritesByBaseUrl = (dapps: DiscoveryDApp[]) => {
    const groupedData = dapps.reduce((acc: { [key: string]: DiscoveryDApp[] }, item) => {
        const baseUrl = URIUtils.getHostName(item.href)

        if (baseUrl) {
            if (!acc[baseUrl]) {
                acc[baseUrl] = []
            }
            acc[baseUrl].push(item)
        }
        return acc
    }, {})

    return Object.values(groupedData)
}
