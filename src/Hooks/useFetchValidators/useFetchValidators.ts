import { useQuery } from "@tanstack/react-query"
import { useAppSelector } from "~Storage/Redux"
import { Validator, ValidatorHubUrls } from "~Constants"
import { selectSelectedNetwork } from "~Storage/Redux/Selectors/Network"
import { NETWORK_TYPE } from "~Model"

type ValidatorNetwork = "devnet" | "test" | "main"

const getValidatorNetwork = (networkType: NETWORK_TYPE): ValidatorNetwork => {
    switch (networkType) {
        case NETWORK_TYPE.MAIN:
            return "main"
        case NETWORK_TYPE.TEST:
            return "test"
        default:
            return "devnet"
    }
}

export const useFetchValidators = () => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const network = getValidatorNetwork(selectedNetwork.type)

    const {
        data: validators,
        isLoading,
        isFetching,
    } = useQuery<Validator[]>({
        queryKey: ["fetchValidators", network],
        queryFn: async () => {
            const url = ValidatorHubUrls[network]
            const response = await fetch(url)
            const data = await response.json()
            return data
        },
        staleTime: 1000 * 60 * 60 * 24,
    })

    return { validators, isLoading, isFetching, network }
}
