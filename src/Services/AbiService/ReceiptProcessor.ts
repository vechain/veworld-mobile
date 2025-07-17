import { AbiManager, EventResult, InspectableOutput } from "./AbiManager"
import { ReceiptOutput } from "./ReceiptOutput"

export class ReceiptProcessor {
    constructor(private readonly abiManagers: AbiManager[]) {}

    analyzeReceipt(outputs: InspectableOutput[], origin: string): ReceiptOutput[] {
        const receiptOutputs: ReceiptOutput[] = []
        for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i]
            const events = this.abiManagers.reduce(
                (acc, curr) => curr.parseEvents(output, acc, origin),
                [] as EventResult[],
            )

            receiptOutputs.push(
                ...(events.map(evt => ({
                    clauseIndex: i,
                    name: evt.name,
                    params: evt.params,
                    address: evt.address,
                })) as any),
            )
        }
        return receiptOutputs
    }
}
