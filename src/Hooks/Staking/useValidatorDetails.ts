import { useQuery } from "@tanstack/react-query"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { useIndexerUrl } from "~Hooks/useIndexerUrl"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

export const useValidatorDetails = ({ validatorId }: { validatorId?: string | null }) => {
    const network = useAppSelector(selectSelectedNetwork)
    const indexer = useIndexerClient(network)
    const indexerUrl = useIndexerUrl(network)
    return useQuery({
        queryKey: ["VALIDATOR_DETAILS", network.genesis.id, validatorId],
        queryFn: () =>
            indexer
                .GET("/api/v1/validators", {
                    params: {
                        query: {
                            validatorId: validatorId!,
                        },
                    },
                })
                .then(res => res.data!.data?.[0] ?? null),
        enabled: !!validatorId && !!indexerUrl,
    })
}
