import { Transaction } from "@vechain/sdk-core"
import { Event, Output, Transfer } from "@vechain/sdk-network"

export interface IndexableAbi {
    fullSignature: string
    name: string
    isEvent(transaction: Transaction, events: Event | Event[], transfer: Transfer[]): boolean
    decode(
        transaction: Transaction,
        events: Event | Event[],
        transfers: Transfer[],
    ): {
        [key: string]: unknown
    }
}

export type EventResult = { name: string; params: { [key: string]: unknown } }
export abstract class AbiManager {
    protected indexableAbis: IndexableAbi[] | undefined

    protected assertEventsLoaded(): asserts this is { indexableAbis: IndexableAbi[] } {
        if (this.indexableAbis === undefined) throw new Error("[assertEventsLoaded]: Load ABIs first")
    }

    async loadAbis() {
        this.indexableAbis = await this._loadAbis()
    }

    protected abstract _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[]
    protected abstract _parseEvents(transaction: Transaction, output: Output, prevEvents: EventResult[]): EventResult[]

    parseEvents(transaction: Transaction, output: Output, prevEvents: EventResult[]) {
        this.assertEventsLoaded()
        return this._parseEvents(transaction, output, prevEvents)
    }
}
