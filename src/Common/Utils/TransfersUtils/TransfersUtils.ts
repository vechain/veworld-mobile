import { abi, address } from "thor-devkit"
import { VET } from "~Common/Constant"
import { FungibleToken, TransferLog } from "~Model"
import AddressUtils from "../AddressUtils"
import { DIRECTIONS } from "~Common/Enums"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { debug } from "~Common/Logger"

export interface IQueryParams {
    thor: Connex.Thor
    token: FungibleToken
    accountAddress: string
    fromBlock: number
    toBlock: number
    offset: number
    size: number
}

/**
 *  Get the transfers for a token and account address within a block range and offset and size
 *  Differentiating between VET and VIP180 tokens because of the different ways they are stored on the blockchain
 *  as VET is built into the blockchain and VIP180 tokens are smart contracts
 * @param params  - The query params
 * @returns
 */
export const getTransfers = async (
    params: IQueryParams,
): Promise<TransferLog[]> => {
    if (params.token.symbol === VET.symbol) return getVetTransfers(params)

    return getTokenTransfers(params)
}

/**
 *  Get the transfers for a VET token and account address within a block range and offset and size
 *  There is no smart contract for VET so we need to use the `transfer` filter
 *  to get the transfers for VET
 * @param params  - The query params
 * @returns {TransferLog[]} - The transfers
 */
const getVetTransfers = async (
    params: IQueryParams,
): Promise<TransferLog[]> => {
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
            index: item.meta.clauseIndex,
            direction: AddressUtils.compareAddresses(
                item.sender,
                params.accountAddress,
            )
                ? DIRECTIONS.UP
                : DIRECTIONS.DOWN,
        }
    })
}

/**
 *  Get the transfers for a VIP180 token and account address within a block range and offset and size
 *  There is a smart contract for VIP180 tokens so we need to use the `event` filter
 * @param params  - The query params
 * @returns {TransferLog[]} - The transfers
 */
const getTokenTransfers = async (
    params: IQueryParams,
): Promise<TransferLog[]> => {
    const tokenCriteria = buildEventCriteria(
        params.thor,
        [params.token.address],
        params.accountAddress,
    )
    const filter = params.thor.filter("event", tokenCriteria)

    debug({ filter })

    const events = await filter
        .order("desc")
        .range({
            unit: "block",
            from: params.fromBlock,
            to: params.toBlock,
        })
        .cache([params.accountAddress])
        .apply(params.offset, params.size)

    const ev = new abi.Event(abis.vip180.TransferEvent)

    return events.map(item => {
        const decode = ev.decode(item.data, item.topics)
        return {
            transactionId: item.meta.txID,
            token: params.token,
            meta: item.meta,
            sender: decode.from,
            amount: decode.value,
            recipient: decode.to,
            index: item.meta.clauseIndex,
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

/**
 *  Build the event criteria for a token and account address to get the transfers for a VIP180 token and account address
 *  The event criteria is used to get the addresses involved in the transfer
 * @param thor   - The thor instance
 * @param tokens  - The tokens to get the transfers for
 * @param addr  - The account address to get the transfers for
 * @returns  - The event criteria
 */
const buildEventCriteria = (
    thor: Connex.Thor,
    tokens: string[],
    addr: string,
): Connex.Thor.Filter.Criteria<"event">[] => {
    const from = tokens.map(item => {
        return thor.account(item).event(abis.vip180.TransferEvent).asCriteria({
            from: addr,
        })
    })
    const to = tokens.map(item => {
        return thor.account(item).event(abis.vip180.TransferEvent).asCriteria({
            to: addr,
        })
    })
    return [...from, ...to]
}
