import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { components } from "~Generated/indexer/schema"
import { IndexerClient, useIndexerClient } from "~Hooks/useIndexerClient"
import { ActivityEvent } from "~Model"
import { DEFAULT_PAGE_SIZE } from "~Networking/API"
import { selectLastValidatorExited, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

const getValidatorExitedEvents = async (
    indexer: IndexerClient,
    address: string,
    lastValidatorExitTimestamp: number,
) => {
    const results: components["schemas"]["IndexedHistoryEvent"][] = []
    let page = 0
    try {
        while (true) {
            const r = await indexer
                .GET("/api/v2/history/{account}", {
                    params: {
                        path: {
                            account: address,
                        },
                        query: {
                            eventName: [
                                ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR,
                                ActivityEvent.STARGATE_DELEGATE_REQUEST,
                            ],
                            after: lastValidatorExitTimestamp,
                            page: page,
                            size: DEFAULT_PAGE_SIZE,
                            direction: "DESC",
                        },
                    },
                })
                .then(res => res.data!)
            results.push(...r.data)
            if (!r.pagination.hasNext) break
            page++
        }
        return results
    } catch (error) {
        throw new Error(`Error fetching validator exited events ${error}`)
    }
}

/**
 * Hook to get the last validator exit events for the selected account on current network.
 * It will return the last validator exit events that has been registerd after the last validator exit timestamp stored in the redux store.
 * @returns The last validator exit events.
 */
export const useValidatorExit = () => {
    const network = useAppSelector(selectSelectedNetwork)
    const account = useAppSelector(selectSelectedAccount)
    const lastValidatorExitTimestamp = useAppSelector(selectLastValidatorExited)

    const indexer = useIndexerClient(network)

    const { data, isLoading, error, isError } = useQuery({
        queryKey: ["validatorExitEvents", network.genesis.id, account.address, lastValidatorExitTimestamp],
        queryFn: async () => await getValidatorExitedEvents(indexer, account.address, lastValidatorExitTimestamp ?? 0),
        select: d => {
            const delegateRequestEvents = d.filter(event => event.eventName === ActivityEvent.STARGATE_DELEGATE_REQUEST)
            const latestDelegateRequestTimestamp =
                delegateRequestEvents.length > 0 ? delegateRequestEvents[0].blockTimestamp : 0

            const validatorExitEvents = d.filter(
                event =>
                    event.eventName === ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR &&
                    event.blockTimestamp > latestDelegateRequestTimestamp,
            )

            const groupedValidators = validatorExitEvents.reduce((acc, event) => {
                return { ...acc, [event.validator!]: [...(acc[event.validator!] ?? []), event] }
            }, {} as Record<string, components["schemas"]["IndexedHistoryEvent"][]>)

            return groupedValidators
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        enabled: !AccountUtils.isObservedAccount(account),
    })

    return useMemo(
        () => ({
            data: data ?? {},
            isLoading,
            error,
            isError,
        }),
        [data, isLoading, error, isError],
    )
}
