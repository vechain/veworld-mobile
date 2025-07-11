import { Clause, Transaction } from "@vechain/sdk-core"
import { Event, Output, Transfer } from "@vechain/sdk-network"

export interface IndexableEvent {
    isEvent(transaction: Transaction, events: Event | Event[], transfer: Transfer): boolean
    decode(
        transaction: Transaction,
        events: Event | Event[],
        transfer: Transfer,
    ): {
        [key: string]: unknown
    }
}

export abstract class AbiManager {
    protected indexableEvents: IndexableEvent[] | undefined

    async loadAbis() {
        this.indexableEvents = await this._loadAbis()
    }

    abstract _loadAbis(): Promise<IndexableEvent[]>

    protected assertEventsLoaded(): asserts this is { indexableEvents: IndexableEvent[] } {
        if (this.indexableEvents === undefined) throw new Error("[assertEventsLoaded]: Load ABIs first")
    }
}
