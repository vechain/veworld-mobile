import { Event, Transfer } from "@vechain/sdk-network"

export type InspectableOutput = {
    events: Event[]
    transfers: Transfer[]
}

export type EventResult = {
    name: string
    /** Address that generated the event */
    address?: string
    params: { [key: string]: unknown }
}
export interface IndexableAbi {
    fullSignature: string
    name: string
    decode(
        event: Event | undefined,
        transfer: Transfer | undefined,
        prevEvents: EventResult[],
        origin: string,
    ):
        | {
              [key: string]: unknown
          }
        | undefined
}

export abstract class AbiManager {
    protected indexableAbis: IndexableAbi[] | undefined

    protected assertEventsLoaded(): asserts this is { indexableAbis: IndexableAbi[] } {
        if (this.indexableAbis === undefined) throw new Error("[assertEventsLoaded]: Load ABIs first")
    }

    loadAbis() {
        this.indexableAbis = this._loadAbis()
    }

    protected abstract _loadAbis(): IndexableAbi[]
    protected abstract _parseEvents(output: InspectableOutput, prevEvents: EventResult[], origin: string): EventResult[]

    parseEvents(output: InspectableOutput, prevEvents: EventResult[], origin: string) {
        this.assertEventsLoaded()
        return this._parseEvents(output, prevEvents, origin)
    }
}
