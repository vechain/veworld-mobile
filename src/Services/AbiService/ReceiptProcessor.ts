import { AbiManager, EventResult } from "./AbiManager"
import { Output } from "@vechain/sdk-network"
import generated from "./generated"
import { AbiEventParameter, AbiParameterToPrimitiveType } from "abitype"
import business_events_generated from "./business_events_generated"

type ValueOf<T> = T[keyof T]

type OutputArrayToObject<TParameters extends any[] | readonly any[]> = TParameters extends readonly [
    infer First,
    ...infer Rest,
]
    ? First extends AbiEventParameter & { name: string }
        ? {
              [key in First["name"]]: AbiParameterToPrimitiveType<First>
          } & OutputArrayToObject<Rest>
        : never
    : {}

export type ReceiptOutput = {
    clauseIndex: number
} & (
    | ValueOf<{
          [key in keyof typeof generated]: {
              name: key
              params: OutputArrayToObject<(typeof generated)[key]["inputs"]>
          }
      }>
    | ValueOf<{
          [key in keyof typeof business_events_generated]: {
              name: key
              params: OutputArrayToObject<(typeof business_events_generated)[key]["inputs"]>
          }
      }>
)

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

            receiptOutputs.push(...(events.map(evt => ({ clauseIndex: i, name: evt.name, params: evt.params })) as any))
        }
        return receiptOutputs
    }
}
