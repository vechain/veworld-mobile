import { abi, address } from "thor-devkit"
import {
    AddressUtils,
    DIRECTIONS,
    ThorConstants,
    TokenConstants,
} from "~Common"
import { FungibleToken, TransferLogItem } from "~Model"

export interface IQueryParams {
    thor: Connex.Thor
    token: FungibleToken
    accountAddress: string
    fromBlock: number
    toBlock: number
    offset: number
    size: number
}

const getTransfers = async (
    params: IQueryParams,
): Promise<TransferLogItem[]> => {
    return params.token.symbol === TokenConstants.VET.symbol
        ? getVetTransfers(params)
        : getTokenTransfers(params)
}

const getVetTransfers = async (
    params: IQueryParams,
): Promise<TransferLogItem[]> => {
    const transferCriteria = [
        { sender: params.accountAddress },
        { recipient: params.accountAddress },
    ]

    const filter = params.thor.filter("transfer", transferCriteria)
    const transfers = await filter
        .order("desc")
        .range({
            unit: "block",
            from: params.fromBlock,
            to: params.toBlock,
        })
        .cache([params.accountAddress])
        .apply(params.offset, params.size)

    return transfers.map(item => {
        return {
            transactionId: item.meta.txID,
            token: params.token,
            meta: item.meta,
            amount: item.amount,
            sender: address.toChecksumed(item.sender),
            recipient: address.toChecksumed(item.recipient),
            timestamp: item.meta.blockTimestamp,
            direction: AddressUtils.compareAddresses(
                item.sender,
                params.accountAddress,
            )
                ? DIRECTIONS.UP
                : DIRECTIONS.DOWN,
        }
    })
}

const getTokenTransfers = async (
    params: IQueryParams,
): Promise<TransferLogItem[]> => {
    const tokenCriteria = buildEventCriteria(
        params.thor,
        [params.token.address],
        params.accountAddress,
    )
    const filter = params.thor.filter("event", tokenCriteria)

    const events = await filter
        .order("desc")
        .range({
            unit: "block",
            from: params.fromBlock,
            to: params.toBlock,
        })
        .cache([params.accountAddress])
        .apply(params.offset, params.size)

    const ev = new abi.Event(ThorConstants.abis.vip180.TransferEvent)

    return events.map(item => {
        const decode = ev.decode(item.data, item.topics)
        return {
            transactionId: item.meta.txID,
            token: params.token,
            meta: item.meta,
            sender: decode.from,
            amount: decode.value,
            recipient: decode.to,
            timestamp: item.meta.blockTimestamp,
            direction: AddressUtils.compareAddresses(
                decode.from,
                params.accountAddress,
            )
                ? DIRECTIONS.UP
                : DIRECTIONS.DOWN,
        }
    })
}

const buildEventCriteria = (
    thor: Connex.Thor,
    tokens: string[],
    addr: string,
): Connex.Thor.Filter.Criteria<"event">[] => {
    const from = tokens.map(item => {
        return thor
            .account(item)
            .event(ThorConstants.abis.vip180.TransferEvent)
            .asCriteria({
                from: addr,
            })
    })
    const to = tokens.map(item => {
        return thor
            .account(item)
            .event(ThorConstants.abis.vip180.TransferEvent)
            .asCriteria({
                to: addr,
            })
    })
    return [...from, ...to]
}

export default { getTransfers }
