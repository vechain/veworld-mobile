import { Abi, AbiEvent, AbiEventParameter, ExtractAbiEvent, ExtractAbiEventNames } from "abitype"

const buildFakeSignature = (event: AbiEvent) => {
    if (event.inputs.length === 0) return event.name
    return `${event.name}(${event.inputs.map(input => `${input.indexed ? "indexed " : ""}${input.type}`).join(",")})`
}

type ArrayJoin<TArray extends any[] | readonly any[], Separator extends string> = TArray extends readonly [
    infer First extends string,
    ...infer Rest,
]
    ? `${First}${Rest["length"] extends 0 ? "" : Separator}${ArrayJoin<Rest, Separator>}`
    : ""

type ToIndexedString<TParameter> = TParameter extends AbiEventParameter
    ? TParameter["indexed"] extends true
        ? `indexed ${TParameter["type"]}`
        : TParameter["type"]
    : never

type ToInputFakeSignature<TParameters extends any[] | readonly any[]> = TParameters extends readonly [
    infer First,
    ...infer Rest,
]
    ? readonly [ToIndexedString<First>, ...ToInputFakeSignature<Rest>]
    : TParameters extends [infer First, ...infer Rest]
    ? [ToIndexedString<First>, ...ToInputFakeSignature<Rest>]
    : []
type BuildFakeSignature<TAbiEvent extends AbiEvent> = TAbiEvent["inputs"]["length"] extends 0
    ? TAbiEvent["name"]
    : `${TAbiEvent["name"]}(${ArrayJoin<ToInputFakeSignature<TAbiEvent["inputs"]>, ",">})`

type ValuesOf<T> = T[keyof T]
type ExtractFakeSignatureEvents<TAbi extends Abi> = ValuesOf<{
    [key in ExtractAbiEventNames<TAbi>]: BuildFakeSignature<ExtractAbiEvent<TAbi, key>>
}>

type ExtractEventNameFromFakeSignature<TKey> = TKey extends `${infer First extends string}(` ? First : TKey

export class AbiBuilder<TEvents extends Record<string, AbiEvent> = {}> {
    events: TEvents = {} as any

    addAbi<TAbi extends Abi>(
        abi: TAbi,
    ): AbiBuilder<
        TEvents & {
            [key in Exclude<ExtractFakeSignatureEvents<TAbi>, keyof TEvents>]: ExtractAbiEvent<
                TAbi,
                ExtractEventNameFromFakeSignature<key>
            >
        }
    > {
        this.events = {
            ...this.events,
            ...Object.fromEntries(
                abi
                    .filter(u => u.type === "event" && !this.events[buildFakeSignature(u)])
                    .map(u => [buildFakeSignature(u as AbiEvent), u]),
            ),
        }
        return this as any
    }

    concat<TAbiBuilder extends AbiBuilder>(
        abiBuilder: TAbiBuilder,
    ): TAbiBuilder extends AbiBuilder<infer BuilderEvents>
        ? AbiBuilder<TEvents & { [key in Exclude<keyof BuilderEvents, keyof TEvents>]: BuilderEvents[key] }>
        : never {
        this.events = {
            ...this.events,
            ...Object.fromEntries(Object.entries(abiBuilder.events).filter(([key]) => !this.events[key])),
        }
        return this as any
    }

    getEvent<TKey extends keyof TEvents>(key: TKey): TEvents[TKey] {
        return this.events[key]
    }
}
