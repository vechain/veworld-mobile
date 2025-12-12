import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const useIsVeBetterUser = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const indexer = useMainnetIndexerClient()
    return useQuery({
        queryKey: ["USER", "VEBETTER", selectedAccount.address],
        queryFn: () =>
            indexer
                .GET("/api/v1/b3tr/actions/users/{wallet}", {
                    params: {
                        path: {
                            wallet: selectedAccount.address,
                        },
                        query: {
                            page: 0,
                            size: 20,
                        },
                    },
                })
                .then(res => res.data!),
        select(data) {
            return data.data.length > 0
        },
        placeholderData: keepPreviousData,
    })
}
