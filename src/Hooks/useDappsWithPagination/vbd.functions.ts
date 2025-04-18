import { queryClient } from "~Api/QueryProvider"
import { DiscoveryDApp } from "~Constants"
import { VeBetterDaoDapp, VeBetterDaoDAppMetadata } from "~Model"
import { getVeBetterDaoDAppMetadata } from "~Networking"
import { UseDappsWithPaginationSortKey } from "./types"
import { URIUtils } from "~Utils"

export const sortVBDDapps = (sort: UseDappsWithPaginationSortKey) => (a: VeBetterDaoDapp, b: VeBetterDaoDapp) => {
    switch (sort) {
        case "alphabetic_asc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        case "alphabetic_desc":
            return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1
        case "newest":
            return new Date(b.createdAtTimestamp).getTime() - new Date(a.createdAtTimestamp).getTime()
    }
}

export const fetchVBDMetadata = (dapp: VeBetterDaoDapp) => {
    return queryClient.fetchQuery({
        queryKey: ["DAPP_METADATA", dapp.metadataURI],
        queryFn: () => getVeBetterDaoDAppMetadata(`ipfs://${dapp.metadataURI}`),
    })
}

export const mapVBDDappToDiscoveryDapp = (dapp: VeBetterDaoDapp & VeBetterDaoDAppMetadata): DiscoveryDApp => {
    return {
        name: dapp.name,
        href: new URL(dapp.external_url).origin,
        desc: dapp.description,
        createAt: new Date(dapp.createdAtTimestamp).getTime(),
        isCustom: false,
        amountOfNavigations: 0,
        isVeWorldSupported: true,
        veBetterDaoId: dapp.id,
        tags: ["__vebetterdao__internal"],
        iconUri: URIUtils.convertUriToUrl(dapp.logo),
    }
}
