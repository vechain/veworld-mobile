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
}
