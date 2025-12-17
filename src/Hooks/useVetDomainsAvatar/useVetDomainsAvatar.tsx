import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useThorClient } from "~Hooks/useThorClient"
import { useVns } from "~Hooks/useVns"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import VetDomainUtils from "~Utils/VetDomainUtils"

export const useVetDomainsAvatar = ({ address }: { address: string }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const thor = useThorClient()

    const { name } = useVns({
        address,
        name: "",
    })

    const registryAddress = useMemo(
        () => VetDomainUtils.getVetDomainsRegistryAddress(network.genesis.id),
        [network.genesis.id],
    )

    return useQuery({
        queryKey: ["VET_DOMAIN", "AVATAR_OF_ADDRESS", address.toLowerCase(), network.genesis.id],
        staleTime: 1000 * 60 * 5, // 5 minutes
        queryFn: () =>
            VetDomainUtils.getAvatar(name, {
                thor,
                genesisId: network.genesis.id,
                vetDomainsAddress: registryAddress!,
            }),
        enabled: !!name && !!registryAddress,
    })
}
