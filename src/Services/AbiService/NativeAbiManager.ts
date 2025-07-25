import { Event, Transfer } from "@vechain/sdk-network"
import { AbiManager, EventResult, IndexableAbi, InspectableOutput } from "./AbiManager"
import { ethers } from "ethers"

function assertsIsTransfer(event: Event | undefined, transfer: Transfer | undefined): asserts transfer is Transfer {
    if (event) throw new Error("[NativeAbiManager]: Error while decoding.")
    if (!transfer) throw new Error("[NativeAbiManager]: Error while decoding.")
}

export class NativeAbiManager extends AbiManager {
    protected _loadAbis(): IndexableAbi[] {
        return [
            {
                name: "VET_TRANSFER",
                fullSignature: "VET_TRANSFER(address,address,uint256)",
                decode(event, transfer) {
                    assertsIsTransfer(event, transfer)
                    return {
                        from: transfer.sender,
                        to: transfer.recipient,
                        amount: BigInt(ethers.BigNumber.from(transfer.amount).toString()),
                    }
                },
            },
        ]
    }
    protected _parseEvents(output: InspectableOutput, prevEvents: EventResult[], origin: string): EventResult[] {
        const transfers = output.transfers
            .map(transfer => {
                const found = this.indexableAbis?.find(abi => abi.decode(undefined, transfer, [], origin) !== undefined)
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
