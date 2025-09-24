import { useQueries } from "@tanstack/react-query"
import moment from "moment"
import { fetchVeBetterUserGeneralOverview, fetchVeBetterUserOverview } from "~Networking"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

export const useUserVeBetterStats = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    return useQueries({
        queries: [
            {
                queryKey: ["VEBETTER", "GENERAL", selectedAccount.address],
                queryFn: () => fetchVeBetterUserGeneralOverview(selectedAccount.address),
            },
            {
                queryKey: ["VEBETTER", "WEEK", selectedAccount.address],
                queryFn: () =>
                    fetchVeBetterUserOverview(
                        selectedAccount.address,
                        moment().startOf("week").toISOString(),
                        moment().endOf("week").toISOString(),
                    ),
            },
            {
                queryKey: ["VEBETTER", "MONTH", selectedAccount.address],
                queryFn: () =>
                    fetchVeBetterUserOverview(
                        selectedAccount.address,
                        moment().startOf("month").toISOString(),
                        moment().endOf("month").toISOString(),
                    ),
            },
        ],
        combine(results) {
            return {
                isLoading: results.some(result => result.isLoading),
                data: results.some(result => !result.data)
                    ? undefined
                    : {
                          totalImpact: {},
                          ...results[0].data!,
                          week: results[1].data!.data.reduce(
                              (acc, curr) => acc.plus(curr.totalRewardAmount),
                              BigNutils("0"),
                          ).toString,
                          month: results[2].data!.data.reduce(
                              (acc, curr) => acc.plus(curr.totalRewardAmount),
                              BigNutils("0"),
                          ).toString,
                      },
            }
        },
    })
}
