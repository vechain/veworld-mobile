import { Event, Output, Transfer } from "@vechain/sdk-network"

export type EventResult = {
    name: string
    /** Address that generated the event */
    address?: string
    params: { [key: string]: unknown }
}
export interface IndexableAbi {
    fullSignature: string
    name: string
    isEvent(event: Event | undefined, transfer: Transfer | undefined, prevEvents: EventResult[]): boolean
    decode(
        event: Event | undefined,
        transfer: Transfer | undefined,
        prevEvents: EventResult[],
    ): {
        [key: string]: unknown
    }
}

export abstract class AbiManager {
    protected indexableAbis: IndexableAbi[] | undefined

    protected assertEventsLoaded(): asserts this is { indexableAbis: IndexableAbi[] } {
        if (this.indexableAbis === undefined) throw new Error("[assertEventsLoaded]: Load ABIs first")
    }

    async loadAbis() {
        this.indexableAbis = await this._loadAbis()
    }

    protected abstract _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[]
    protected abstract _parseEvents(output: Output, prevEvents: EventResult[]): EventResult[]

    parseEvents(output: Output, prevEvents: EventResult[]) {
        this.assertEventsLoaded()
        return this._parseEvents(output, prevEvents)
    }
}
