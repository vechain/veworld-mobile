import { ethers } from "ethers"
import { AbiManager, EventResult, IndexableAbi } from "./AbiManager"
import generated from "./generated"
import { Transaction } from "@vechain/sdk-core"
import { Output } from "@vechain/sdk-network"
import { AbiEventParameter } from "abitype"

const getIndexedInputs = (inputs: AbiEventParameter[] | readonly AbiEventParameter[]) => {
    return inputs.filter(input => input.indexed)
}

export class GenericAbiManager extends AbiManager {
    protected _loadAbis(): IndexableAbi[] {
        return Object.entries(generated).map(([fullSignature, item]) => {
            const iface = new ethers.utils.Interface([item])
            return {
                name: item.name,
                fullSignature,
                isEvent(_, events, __) {
                    if (Array.isArray(events)) return false
                    if (events.topics.length - 1 !== getIndexedInputs(item.inputs).length) return false
                    return iface.getEventTopic(item.name).toLowerCase() === events.topics[0]
                },
                decode(_, events, __) {
                    if (Array.isArray(events))
                        throw new Error("[GenericAbiManager]: Invalid input. Events cannot be an array")
                    const decodedLog = iface.decodeEventLog(item.name, events.data, events.topics)
                    return Object.fromEntries(Object.entries(decodedLog).filter(([key]) => !key.match(/^\d+$/)))
                },
            } satisfies IndexableAbi
        })
    }

    protected _parseEvents(transaction: Transaction, output: Output, prevEvents: EventResult[]): EventResult[] {
        if (prevEvents.length !== 0)
            throw new Error("[GenericAbiManager]: This should be the first ABI Manager in the list")

        return output.events
            .map(evt => {
                const found = this.indexableAbis?.find(abi => abi.isEvent(transaction, evt, output.transfers))
                if (!found) return false
                return {
                    name: found.fullSignature,
                    params: found.decode(transaction, evt, output.transfers),
                }
            })
            .filter((u): u is EventResult => typeof u !== "boolean")
    }
}
