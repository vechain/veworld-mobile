import { DiscoveryDApp } from "~Constants"

export enum HistoryUrlKind {
    DAPP,
    URL,
}
export type HistoryDappItem = {
    type: HistoryUrlKind.DAPP
    dapp: DiscoveryDApp
}

export type HistoryUrlItem = {
    type: HistoryUrlKind.URL
    url: string
}

export type HistoryItem = HistoryDappItem | HistoryUrlItem

export const mapHistoryUrls = (urls: string[], dapps: DiscoveryDApp[]): HistoryItem[] => {
    const mappedUrls = urls
        .map((url, idx) => {
            const baseURL = new URL(url).origin
            const foundDapp = dapps.find(dapp => new URL(dapp.href).origin === baseURL)
            if (foundDapp) return { type: HistoryUrlKind.DAPP, dapp: foundDapp, origin: baseURL, index: idx }
            return { type: HistoryUrlKind.URL, url: baseURL, origin: baseURL, index: idx }
        })
        .sort((a, b) => b.index - a.index)
    return [
        ...mappedUrls
            .reduce((acc, curr) => {
                if (acc.has(curr.origin)) return acc
                acc.set(curr.origin, { type: curr.type, dapp: curr.dapp, url: curr.url } as HistoryItem)
                return acc
            }, new Map<string, HistoryItem>())
            .values(),
    ]
}
