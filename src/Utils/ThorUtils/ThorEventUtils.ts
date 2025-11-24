import { ABIContract, ABIEvent } from "@vechain/sdk-core"
import { EventCriteria, EventLogs, PaginationOptions, ThorClient } from "@vechain/sdk-network"
import { Abi, AbiParametersToPrimitiveTypes, ExtractAbiEvent } from "abitype"
import { ContractEventName, GetEventArgs } from "viem"

type EventParameters<TAbi extends Abi, TEventName extends ContractEventName<TAbi>> = GetEventArgs<
    TAbi,
    TEventName,
    { IndexedOnly: true; Required: false }
>

type TypedFilterCriteria<TAbi extends Abi, TEventName extends ContractEventName<TAbi>> = {
    criteria: EventCriteria
    eventAbi: ABIEvent<TAbi, TEventName>
}

type ToTypedEventLog<TCriteria> = TCriteria extends TypedFilterCriteria<infer TAbi, infer TEventName>
    ? Omit<EventLogs, "decodedData"> & {
          decodedData: AbiParametersToPrimitiveTypes<ExtractAbiEvent<TAbi, TEventName>["inputs"]>
          name: ExtractAbiEvent<TAbi, TEventName>["name"]
      }
    : never

type TypedEventLogs<TCriteria extends any[]> = TCriteria extends [
    infer First extends TypedFilterCriteria<any, any>,
    ...infer Rest,
]
    ? [ToTypedEventLog<First>, ...TypedEventLogs<Rest>]
    : []

/**
 * Get the filter criteria that you can pass to {@link filterEventLogs}.
 * Prefer {@link getFilterCriteriaOfRawEvent} if you need to loop through elements with the same event
 * @param contractAddress Contract address
 * @param abi ABI of the contract
 * @param eventName Name of the event
 * @param parameters Parameters of the event (only indexed)
 * @returns Typed Filter Criteria that you can pass to {@link filterEventLogs}
 * 
 * @example
 * const criteria = ThorUtils.events.getFilterCriteriaOfEvent(
            config.STARGATE_NFT_CONTRACT_ADDRESS!,
            [StargateNftEvents.BaseVTHORewardsClaimed],
            "BaseVTHORewardsClaimed",
            {
                owner: accountAddress,
                tokenId: BigInt(nodeId),
            },
        ))
 */
export const getFilterCriteriaOfEvent = <TAbi extends Abi, TEventName extends ContractEventName<TAbi>>(
    contractAddress: string,
    abi: TAbi,
    eventName: TEventName,
    parameters: EventParameters<TAbi, TEventName>,
): TypedFilterCriteria<TAbi, TEventName> => {
    const evt = ABIContract.ofAbi(abi).getEvent(eventName)
    const topics = new Map<number, string | undefined>(
        evt.encodeFilterTopicsNoNull(parameters as any).map((topic, index) => [index, topic]),
    )

    return {
        criteria: {
            address: contractAddress,
            topic0: topics.get(0) as string, // the first topic is always defined since it's the event signature
            topic1: topics.has(1) ? topics.get(1) : undefined,
            topic2: topics.has(2) ? topics.get(2) : undefined,
            topic3: topics.has(3) ? topics.get(3) : undefined,
            topic4: topics.has(4) ? topics.get(4) : undefined,
        },
        eventAbi: evt,
    }
}

/**
 * Get the filter criteria that you can pass to {@link filterEventLogs}.
 * Prefer this function over {@link getFilterCriteriaOfEvent} if you need to loop through elements with the same event
 * @param contractAddress Contract address
 * @param event SDK event object
 * @param parameters Parameters of the event
 * @returns Typed Filter Criteria that you can pass to {@link filterEventLogs}
 *
 */
export const getFilterCriteriaOfRawEvent = <TAbi extends Abi, TEventName extends ContractEventName<TAbi>>(
    contractAddress: string,
    event: ABIEvent<TAbi, TEventName>,
    parameters: EventParameters<TAbi, TEventName>,
): TypedFilterCriteria<TAbi, TEventName> => {
    const topics = new Map<number, string | undefined>(
        event.encodeFilterTopicsNoNull(parameters as any).map((topic, index) => [index, topic]),
    )

    return {
        criteria: {
            address: contractAddress,
            topic0: topics.get(0) as string, // the first topic is always defined since it's the event signature
            topic1: topics.has(1) ? topics.get(1) : undefined,
            topic2: topics.has(2) ? topics.get(2) : undefined,
            topic3: topics.has(3) ? topics.get(3) : undefined,
            topic4: topics.has(4) ? topics.get(4) : undefined,
        },
        eventAbi: event,
    }
}

/**
 * Get the typed event logs from criteria defined with {@link getFilterCriteriaOfEvent}.
 * @param thorClient Thor Client
 * @param options Options for the event logs call
 * @param criteria List of criteria for the logs
 * @returns Typed logs that you can map on
 * 
 * @example
 * const result = ThorUtils.event.filterEventLogs(
 *      thor,
 *      { limit: 1000, offset: 0 },
 *      ThorUtils.events.getFilterCriteriaOfEvent(
            config.STARGATE_NFT_CONTRACT_ADDRESS!,
            [StargateNftEvents.BaseVTHORewardsClaimed],
            "BaseVTHORewardsClaimed",
            {
                owner: accountAddress,
                tokenId: BigInt(nodeId),
            },
        ))
 */
export const filterEventLogs = async <TCriteria extends TypedFilterCriteria<any, any>[]>(
    thorClient: ThorClient,
    options: PaginationOptions,
    ...criteria: TCriteria
): Promise<TypedEventLogs<TCriteria>[number][]> => {
    const eventNameByTopic = new Map(
        criteria.map(crit => [crit.criteria.topic0!.toLowerCase(), crit.eventAbi.signature.name]),
    )
    const logs = await thorClient.logs.filterEventLogs({
        criteriaSet: criteria,
        options,
    })

    return logs.map(log => ({
        ...log,
        name: eventNameByTopic.get(log.topics[0].toLowerCase())!,
    })) as any
}
