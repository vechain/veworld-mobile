export type DiscoveryDApp = {
    id?: string
    name: string
    href: string
    desc?: string
    category?: string
    tags?: string[]
    contracts?: string[]
    repo?: string
    createAt: number
    image?: object
    isCustom: boolean
    amountOfNavigations: number
    isVeWorldSupported?: boolean
    veBetterDaoId?: string
    iconUri?: string
}

export const AppHubUrl = process.env.REACT_APP_HUB_URL
export const AppHubIndexUrl = `${AppHubUrl}/index.json`
