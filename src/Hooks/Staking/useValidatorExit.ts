import { useQuery } from "@tanstack/react-query"
import { components } from "~Generated/indexer/schema"
import { useIndexerClient } from "~Hooks/useIndexerClient"
import { ActivityEvent } from "~Model"
import { selectLastValidatorExited, selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
// import AccountUtils from "~Utils/AccountUtils"

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
    return useQuery({
        queryKey: ["validatorExitEvents", network.genesis.id, account.address, lastValidatorExitTimestamp],
        queryFn: () =>
            indexer
                .GET("/api/v2/history/{account}", {
                    params: {
                        path: {
                            account: account.address,
                        },
                        query: {
                            eventName: [
                                ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR,
                                ActivityEvent.STARGATE_DELEGATE_REQUEST,
                            ],
                            after: lastValidatorExitTimestamp,
                            page: 0,
                            size: 20,
                            direction: "DESC",
                        },
                    },
                })
                .then(res => res.data!),
        select: data => {
            const delegateRequestEvents = data.data.filter(
                event => event.eventName === ActivityEvent.STARGATE_DELEGATE_REQUEST,
            )
            const latestDelegateRequestTimestamp =
                delegateRequestEvents.length > 0 ? delegateRequestEvents[0].blockTimestamp : 0

            const validatorExitEvents = data.data.filter(
                event =>
                    event.eventName === ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR &&
                    event.blockTimestamp < latestDelegateRequestTimestamp,
            )

            const groupedValidators = validatorExitEvents.reduce((acc, event) => {
                return { ...acc, [event.validator!]: [...(acc[event.validator!] ?? []), event] }
            }, {} as Record<string, components["schemas"]["IndexedHistoryEvent"][]>)

            return groupedValidators
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        // enabled: !AccountUtils.isObservedAccount(account),
    })
}
