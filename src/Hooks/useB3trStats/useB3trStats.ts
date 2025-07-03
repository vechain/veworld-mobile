import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

type B3TRStats = {
    entity: string
    actionsRewarded: number
    totalRewardAmount: number
    totalImpact: {
        carbon: number
        water: number
        energy: number
        waste_mass: number
        waste_items: number
        waste_reduction: number
        biodiversity: number
        people: number
        timber: number
        plastic: number
        education_time: number
        trees_planted: number
        calories_burned: number
        clean_energy_production_wh: number
        sleep_quality_percentage: number
    }
}

const getB3TrStats = async (address: string) => {
    const r = await axios.get<{ data: B3TRStats[]; pagination: { hasNext: boolean } }>(
        `${process.env.REACT_APP_B3TR_INDEXER_MAINNET_URL}/sustainability/user/overviews`,
        {
            params: {
                wallet: address,
            },
        },
    )

    return r.data.data[0]
}

export const useB3trStats = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    return useQuery({
        queryKey: ["B3TrStats", selectedAccount.address],
        queryFn: ({ queryKey }) => getB3TrStats(queryKey[1]),
    })
}
