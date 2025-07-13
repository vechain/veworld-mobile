import { Output } from "@vechain/sdk-network"
import { AbiManager, EventResult, IndexableAbi } from "./AbiManager"

export class NativeAbiManager extends AbiManager {
    protected _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[] {
        return [
            {
                name: "VET_TRANSFER",
                fullSignature: "VET_TRANSFER(address,address,uint256)",
                isEvent(event, transfer) {
                    if (event) return false
                    return Boolean(transfer)
                },
                decode(event, transfer) {
                    if (event) throw new Error("[NativeAbiManager]: Error while decoding.")
                    if (!transfer) throw new Error("[NativeAbiManager]: Error while decoding.")
                    return { from: transfer.sender, to: transfer.recipient, amount: transfer.amount }
                },
            },
        ]
    }
    protected _parseEvents(output: Output, prevEvents: EventResult[], origin: string): EventResult[] {
        const transfers = output.transfers
            .map(transfer => {
                const found = this.indexableAbis?.find(abi => abi.isEvent(undefined, transfer, [], origin))
                if (!found) return false
                return {
                    name: found.fullSignature,
                    params: found.decode(undefined, transfer, [], origin),
                }
            })
            .filter((u): u is EventResult => typeof u !== "boolean")

        return prevEvents.concat(transfers)
    }
}
