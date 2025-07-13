import { ethers } from "ethers"
import { AbiManager, EventResult, IndexableAbi } from "./AbiManager"
import generated from "./generated"
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
                isEvent(event) {
                    if (!event) throw new Error("[GenericAbiManager]: Error while decoding.")
                    if (event.topics.length - 1 !== getIndexedInputs(item.inputs).length) return false
                    return iface.getEventTopic(item.name).toLowerCase() === event.topics[0]
                },
                decode(event) {
                    if (!event) throw new Error("[GenericAbiManager]: Error while decoding.")
                    const decodedLog = iface.decodeEventLog(item.name, event.data, event.topics)
                    return Object.fromEntries(
                        Object.entries(decodedLog)
                            .filter(([key]) => !key.match(/^\d+$/))
                            .map(([key, value]) =>
                                value instanceof ethers.BigNumber ? [key, value.toString()] : [key, value],
                            ),
                    )
                },
            } satisfies IndexableAbi
        })
    }

    protected _parseEvents(output: Output, prevEvents: EventResult[]): EventResult[] {
        if (prevEvents.length !== 0)
            throw new Error("[GenericAbiManager]: This should be the first ABI Manager in the list")

        return output.events
            .map(evt => {
                const found = this.indexableAbis?.find(abi => abi.isEvent(evt, undefined, []))
                if (!found) return false
                return {
                    name: found.fullSignature,
                    params: found.decode(evt, undefined, []),
                    address: evt.address,
                }
            })
            .filter((u): u is Required<EventResult> => typeof u !== "boolean")
    }
}
