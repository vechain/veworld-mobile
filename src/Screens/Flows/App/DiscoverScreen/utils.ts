import { AppHubUrl } from "./constants"

export const getAppHubIconUrl = (appId: string) => {
    return `${AppHubUrl}/imgs/${appId}.png`
}
