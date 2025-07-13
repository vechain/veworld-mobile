import { AbiManager, EventResult } from "./AbiManager"
import { Output } from "@vechain/sdk-network"

export type ReceiptOutput = {
    clauseIndex: number
    name: string
    params: unknown
}

export class ReceiptProcessor {
    constructor(private readonly abiManagers: AbiManager[]) {}

    analyzeReceipt(outputs: Output[], origin: string): ReceiptOutput[] {
        const receiptOutputs: ReceiptOutput[] = []
        for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i]
            const events = this.abiManagers.reduce(
                (acc, curr) => curr.parseEvents(output, acc, origin),
                [] as EventResult[],
            )

            receiptOutputs.push(...events.map(evt => ({ clauseIndex: i, name: evt.name, params: evt.params })))
        }
        return receiptOutputs
    }
}
