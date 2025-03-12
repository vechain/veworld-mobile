import { useQuery } from "@tanstack/react-query"
import { WaitForTransactionOptions } from "@vechain/sdk-network"
import { useMemo } from "react"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { waitTransaction } from "./transactionWaiter"

type UseWaitTransactionOptions = {
    txId?: string
} & WaitForTransactionOptions

export const useWaitTransaction = (opts: UseWaitTransactionOptions) => {
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const { data, isFetching } = useQuery({
        queryKey: ["TransactionReceipt", opts.txId],
        queryFn: () =>
            waitTransaction(opts.txId!, {
                network: selectedNetwork,
                intervalMs: opts.intervalMs,
                timeoutMs: opts.timeoutMs,
            }),
        enabled: Boolean(opts.txId),
        retry: false,
    })

    const isSuccess = useMemo(() => data != null && !data.reverted, [data])

    return { receipt: data, isFetching, isSuccess }
}
