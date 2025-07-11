import { ethers } from "ethers"
import { AbiManager, IndexableAbi } from "./AbiManager"
import generated from "./generated"

export class GenericAbiManager extends AbiManager {
    protected _loadAbis(): IndexableAbi[] {
        return Object.values(generated).map(item => {
            const iface = new ethers.utils.Interface([item])
            return {
                isEvent(_, events, __) {
                    if (Array.isArray(events)) return false
                    if (events.topics.length !== item.inputs.length) return false
                    return iface.getEventTopic(item.name).toLowerCase() === events.topics[0]
                },
                decode(_, events, __) {
                    if (Array.isArray(events))
                        throw new Error("[GenericAbiManager]: Invalid input. Events cannot be an array")
                    return iface.decodeEventLog(item.name, events.data, events.topics)
                },
            } satisfies IndexableAbi
        })
    }
}
