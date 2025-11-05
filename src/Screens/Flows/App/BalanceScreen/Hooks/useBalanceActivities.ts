import { ActivityEvent } from "~Model"
import { BalanceTab } from "../Tabs/types"
import { selectSelectedAccount, selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useCallback } from "react"
import { createActivityFromIndexedHistoryEvent, fetchIndexedHistoryEvent } from "~Networking"
import { useQuery } from "@tanstack/react-query"

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
                ActivityEvent.STARGATE_CLAIM_REWARDS_BASE,
                ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE,
                ActivityEvent.STARGATE_DELEGATE,
                ActivityEvent.STARGATE_DELEGATE_ONLY,
                ActivityEvent.STARGATE_STAKE,
                ActivityEvent.STARGATE_UNDELEGATE,
                ActivityEvent.STARGATE_UNSTAKE,
            ]
        case "COLLECTIBLES":
            return [ActivityEvent.NFT_SALE, ActivityEvent.TRANSFER_NFT]
    }
}

export const useBalanceActivities = ({ tab }: { tab: BalanceTab }) => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const fetchActivities = useCallback(async () => {
        return await fetchIndexedHistoryEvent(selectedAccount.address, 0, selectedNetwork, getActivityEventsByTab(tab))
    }, [selectedAccount.address, selectedNetwork, tab])

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
