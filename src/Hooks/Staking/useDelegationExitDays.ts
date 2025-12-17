import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { useThorClient } from "~Hooks/useThorClient"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"

const SECONDS_PER_BLOCK = 10
const SECONDS_PER_DAY = 86400

type Props = {
    validatorId: string | null
    enabled?: boolean
}

export const useDelegationExitDays = ({ validatorId, enabled = true }: Props) => {
    const network = useAppSelector(selectSelectedNetwork)
    const indexer = useIndexerClient(network)
    const thor = useThorClient()

    const { data: validatorData, isLoading: isLoadingValidator } = useQuery({
        queryKey: ["validatorCycleEnd", network.genesis.id, validatorId],
        queryFn: async () => {
            if (!validatorId) return null

            const response = await indexer.GET("/api/v1/validators", {
                params: {
                    query: {
                        validatorId,
                    },
                },
            })

            return response.data?.data?.[0] ?? null
        },
        enabled: enabled && !!validatorId,
        staleTime: 60 * 1000, // 1 minute
    })

    const { data: currentBlock, isLoading: isLoadingBlock } = useQuery({
        queryKey: ["currentBlock", network.genesis.id],
        queryFn: async () => {
            const block = await thor.blocks.getBestBlockCompressed()
            return block?.number ?? 0
        },
        enabled: enabled && !!validatorId,
        staleTime: 10 * 1000, // 10 seconds
    })

    const exitDays = useMemo(() => {
        if (!validatorData?.cycleEndBlock || !currentBlock) return undefined

        const blocksRemaining = validatorData.cycleEndBlock - currentBlock
        if (blocksRemaining <= 0) return 0

        const secondsRemaining = blocksRemaining * SECONDS_PER_BLOCK
        const daysRemaining = Math.ceil(secondsRemaining / SECONDS_PER_DAY)

        return daysRemaining
    }, [validatorData?.cycleEndBlock, currentBlock])

    return useMemo(
        () => ({
            exitDays,
            isLoading: isLoadingValidator || isLoadingBlock,
        }),
        [exitDays, isLoadingValidator, isLoadingBlock],
    )
}
