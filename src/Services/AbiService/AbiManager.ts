import { Transaction } from "@vechain/sdk-core"
import { Event, Transfer } from "@vechain/sdk-network"

export interface IndexableAbi {
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
    protected indexableEvents: IndexableAbi[] | undefined

    async loadAbis() {
        this.indexableEvents = await this._loadAbis()
    }

    protected abstract _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[]

    protected assertEventsLoaded(): asserts this is { indexableEvents: IndexableAbi[] } {
        if (this.indexableEvents === undefined) throw new Error("[assertEventsLoaded]: Load ABIs first")
    }
}
