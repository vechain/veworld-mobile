/**
 * Resolves DAppReference objects into full DiscoveryDApp objects.
 */
import { DiscoveryDApp } from "~Constants"

export type DAppResolverLookups = {
    byId: Map<string, DiscoveryDApp>
    byVbdId: Map<string, DiscoveryDApp>
}

export const resolveDAppFromReference = (
    ref: import("~Storage/Redux").DAppReference,
    { byId, byVbdId }: DAppResolverLookups,
): DiscoveryDApp | null => {
    switch (ref.type) {
        case "app-hub": {
            const dapp = byId.get(ref.id)
            return dapp ? { ...dapp } : null
        }
        case "vbd": {
            const dapp = byVbdId.get(ref.vbdId)
            return dapp ? { ...dapp } : null
        }
        case "custom": {
            return {
                href: ref.url,
                name: ref.title,
                desc: ref.description,
                iconUri: ref.iconUri,
                isCustom: true,
                createAt: ref.createAt,
                amountOfNavigations: 0,
            }
        }
    }
}

export const resolveDAppsFromReferences = (
    refs: Array<import("~Storage/Redux").DAppReference> | undefined,
    lookups: DAppResolverLookups,
): DiscoveryDApp[] => {
    if (!refs || refs.length === 0) return []
    const resolved: DiscoveryDApp[] = []
    for (const ref of refs) {
        const dapp = resolveDAppFromReference(ref, lookups)
        if (dapp) resolved.push(dapp)
    }
    return resolved
}
