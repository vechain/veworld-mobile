import { useQueries } from "@tanstack/react-query"
import moment from "moment"
import { IndexerClient, useMainnetIndexerClient } from "~Hooks/useIndexerClient"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

const getVeBetterUserOverview = (address: string, fromDate: string, toDate: string, indexer: IndexerClient) => {
    const from = moment(fromDate).utc().format("YYYY-MM-DD")
    const to = moment(toDate).utc().format("YYYY-MM-DD")
    const params = new URLSearchParams()
    params.append("startDate", from)
    params.append("endDate", to)
    params.append("size", Math.ceil(moment(toDate).diff(fromDate, "day")).toString())
    return indexer
        .GET("/api/v1/b3tr/actions/users/{wallet}/daily-summaries", {
            params: {
                path: {
                    wallet: address,
                },
                query: {
                    startDate: from,
                    endDate: to,
                    size: Math.ceil(moment(toDate).diff(fromDate, "day")),
                },
            },
        })
        .then(res => res.data!)
}

export const useUserVeBetterStats = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const indexer = useMainnetIndexerClient()
    return useQueries({
        queries: [
            {
                queryKey: ["VEBETTER", "GENERAL", selectedAccount.address],
                queryFn: () =>
                    indexer
                        .GET("/api/v1/b3tr/actions/users/{wallet}/overview", {
                            params: { path: { wallet: selectedAccount.address } },
                        })
                        .then(res => res.data!),
            },
            {
                queryKey: ["VEBETTER", "WEEK", selectedAccount.address],
                queryFn: () =>
                    getVeBetterUserOverview(
                        selectedAccount.address,
                        moment().utc().startOf("week").toISOString(),
                        moment().utc().endOf("week").toISOString(),
                        indexer,
                    ),
            },
            {
                queryKey: ["VEBETTER", "MONTH", selectedAccount.address],
                queryFn: () =>
                    getVeBetterUserOverview(
                        selectedAccount.address,
                        moment().utc().startOf("month").toISOString(),
                        moment().utc().endOf("month").toISOString(),
                        indexer,
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
