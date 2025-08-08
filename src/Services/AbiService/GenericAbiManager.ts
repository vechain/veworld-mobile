import { ethers } from "ethers"
import { AbiManager, EventResult, IndexableAbi, InspectableOutput } from "./AbiManager"
import { Event } from "@vechain/sdk-network"
import { AbiEvent, AbiEventParameter } from "abitype"
import generatedAbi from "~Generated/abi"

const getIndexedInputs = (inputs: AbiEventParameter[] | readonly AbiEventParameter[]) => {
    return inputs.filter(input => input.indexed)
}

function assertsHasEvent(event: Event | undefined): asserts event is Event {
    if (!event) throw new Error("[GenericAbiManager]: Error while decoding.")
}

const isEvent = (event: Event, item: AbiEvent, iface: ethers.utils.Interface) => {
    if (event.topics.length - 1 !== getIndexedInputs(item.inputs).length) return false
    return iface.getEventTopic(item.name).toLowerCase() === event.topics[0]
}

export class GenericAbiManager extends AbiManager {
    protected _loadAbis(): IndexableAbi[] {
        return Object.entries(generatedAbi).map(([fullSignature, item]) => {
            const iface = new ethers.utils.Interface([item])
            return {
                name: item.name,
                fullSignature,
                decode(event) {
                    assertsHasEvent(event)
                    if (!isEvent(event, item, iface)) return undefined
                    const decodedLog = iface.decodeEventLog(item.name, event.data, event.topics)
                    return Object.fromEntries(
                        Object.entries(decodedLog)
                            .filter(([key]) => !key.match(/^\d+$/))
                            .map(([key, value]) =>
                                value instanceof ethers.BigNumber ? [key, BigInt(value.toString())] : [key, value],
                            ),
                    )
                },
            } satisfies IndexableAbi
        })
    }

    protected _parseEvents(output: InspectableOutput, prevEvents: EventResult[], origin: string): EventResult[] {
        if (prevEvents.length !== 0)
            throw new Error("[GenericAbiManager]: This should be the first ABI Manager in the list")

        return output.events
            .map(evt => {
                const found = this.indexableAbis?.find(abi => abi.decode(evt, undefined, [], origin) !== undefined)
                if (!found) return false
                return {
                    name: found.fullSignature,
                    params: found.decode(evt, undefined, [], origin),
                    address: evt.address,
                }
            })
            .filter((u): u is Required<EventResult> => typeof u !== "boolean")
    }
}
