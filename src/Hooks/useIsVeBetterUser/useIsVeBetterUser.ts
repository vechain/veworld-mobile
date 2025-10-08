import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { fetchVeBetterActions } from "~Networking"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const useIsVeBetterUser = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    return useQuery({
        queryKey: ["USER", "VEBETTER", selectedAccount.address],
        queryFn: () => fetchVeBetterActions(selectedAccount.address),
        select(data) {
            return data.data.length > 0
        },
        placeholderData: keepPreviousData,
    })
}
