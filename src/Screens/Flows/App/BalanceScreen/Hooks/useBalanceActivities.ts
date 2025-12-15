import { ActivityEvent } from "~Model"
import { BalanceTab } from "../Tabs/types"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useCallback } from "react"
import { createActivityFromIndexedHistoryEvent, DEFAULT_PAGE_SIZE } from "~Networking"
import { useQuery } from "@tanstack/react-query"
import { useIndexerClient } from "~Hooks/useIndexerClient"

const getActivityEventsByTab = (tab: BalanceTab): ActivityEvent[] => {
    switch (tab) {
        case "TOKENS":
            return [
                ActivityEvent.SWAP_FT_TO_FT,
                ActivityEvent.SWAP_FT_TO_VET,
                ActivityEvent.SWAP_VET_TO_FT,
                ActivityEvent.TRANSFER_FT,
                ActivityEvent.TRANSFER_SF,
                ActivityEvent.TRANSFER_VET,
                ActivityEvent.B3TR_ACTION,
                ActivityEvent.B3TR_CLAIM_REWARD,
                ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
                ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
                ActivityEvent.B3TR_UPGRADE_GM,
            ]
        case "STAKING":
            return [
                ActivityEvent.STARGATE_CLAIM_REWARDS_BASE_LEGACY,
                ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY,
                ActivityEvent.STARGATE_DELEGATE_LEGACY,
                ActivityEvent.STARGATE_STAKE,
                ActivityEvent.STARGATE_UNDELEGATE_LEGACY,
                ActivityEvent.STARGATE_UNSTAKE,
                ActivityEvent.STARGATE_CLAIM_REWARDS,
                ActivityEvent.STARGATE_BOOST,
                ActivityEvent.STARGATE_DELEGATE_REQUEST,
                ActivityEvent.STARGATE_DELEGATE_REQUEST_CANCELLED,
                ActivityEvent.STARGATE_DELEGATE_EXIT_REQUEST,
                ActivityEvent.STARGATE_DELEGATION_EXITED,
                ActivityEvent.STARGATE_DELEGATION_EXITED_VALIDATOR,
                ActivityEvent.STARGATE_DELEGATE_ACTIVE,
                ActivityEvent.STARGATE_MANAGER_ADDED,
                ActivityEvent.STARGATE_MANAGER_REMOVED,
            ]
        case "COLLECTIBLES":
            return [ActivityEvent.NFT_SALE, ActivityEvent.TRANSFER_NFT]
    }
}

export const useBalanceActivities = ({ tab }: { tab: BalanceTab }) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const indexer = useIndexerClient(selectedNetwork)

    const fetchActivities = useCallback(async () => {
        return indexer
            .GET("/api/v2/history/{account}", {
                params: {
                    path: {
                        account: selectedAccount.address,
                    },
                    query: {
                        direction: "DESC",
                        page: 0,
                        size: DEFAULT_PAGE_SIZE,
                        eventName: getActivityEventsByTab(tab),
                    },
                },
            })
            .then(res => res.data!)
    }, [indexer, selectedAccount.address, tab])

    return useQuery({
        queryKey: ["BALANCE_ACTIVITIES", selectedNetwork.genesis.id, selectedAccount.address, tab],
        queryFn: fetchActivities,
        select(_data) {
            return _data.data
                .slice(0, 4)
                .map(evt => createActivityFromIndexedHistoryEvent(evt, selectedAccount.address, selectedNetwork))
                .filter((activity): activity is NonNullable<typeof activity> => activity !== null)
        },
    })
}
