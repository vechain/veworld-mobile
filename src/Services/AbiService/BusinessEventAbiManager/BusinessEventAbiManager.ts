import { Output } from "@vechain/sdk-network"
import businessEvents from "~Generated/businessEvents"
import { NETWORK_TYPE } from "~Model"
import { AbiManager, EventResult, IndexableAbi } from "../AbiManager"
import { cartesian } from "./cartesian"
import { matchesConditions } from "./condition"
import { convertEventResultAliasRecordIntoParams } from "./params"
import { matchesRulesSingle } from "./rule"
import { defaultSorting } from "./sorting"
import { BusinessEvent, EventResultWithAlias } from "./types"

const convertEventResultWithAliasIntoRecord = (results: EventResultWithAlias[]): Record<string, EventResult> => {
    return Object.fromEntries(results.map(({ alias, ...event }) => [alias, event]))
}

const decodeEventFn = (_prevEvents: EventResult[], item: BusinessEvent, origin: string) => {
    let matchingEvents: Record<string, EventResult[]> = {}
    let prevEvents = [..._prevEvents]
    for (let i = 0; i < item.events.length; i++) {
        const itemEvent = item.events[i]
        const foundEvents = prevEvents.filter(evt => evt.name === itemEvent.name)
        if (foundEvents.length === 0) throw new Error("[BusinessEventValidator]: No matching events found")
        const eventsMatchingConditions = matchesConditions(foundEvents, itemEvent.conditions, origin)
        if (eventsMatchingConditions.length === 0)
            throw new Error("[BusinessEventValidator]: No events matching conditions found")
        matchingEvents[itemEvent.alias] = eventsMatchingConditions
        prevEvents = prevEvents.filter(evt => !eventsMatchingConditions.includes(evt))
    }

    if (Object.keys(matchingEvents).length !== item.events.length)
        throw new Error("[BusinessEventValidator]: Number of events do not match")

    if (item.checkAllCombinations) {
        const allCombinations = cartesian(
            Object.entries(matchingEvents).map(([alias, events]) => events.map(evt => ({ ...evt, alias }))),
        )
        for (const combination of allCombinations) {
            const matching = matchesRulesSingle(combination, item.rules, origin)
            if (matching) return convertEventResultWithAliasIntoRecord(combination)
        }

        throw new Error("[BusinessEventValidator]: No matching rules found")
    }

    const parsedRules = Object.entries(matchingEvents).map(([alias, events]) => ({ ...events[0], alias }))
    const rulesMatching = matchesRulesSingle(parsedRules, item.rules, origin)
    if (rulesMatching) return convertEventResultWithAliasIntoRecord(parsedRules)
    throw new Error("[BusinessEventValidator]: No matching rules found")
}

const PLACEHOLDER_REGEX = /^\$\{(\w+)\}$/

const substituteString = (value: string | number, network: NETWORK_TYPE, params: Record<string, string>) => {
    if (typeof value === "number") return value
    if (!PLACEHOLDER_REGEX.test(value)) return value
    const param = value.match(PLACEHOLDER_REGEX)![1]
    return params[`${param}_${network}`] ?? params[param] ?? param
}

const replaceItemWithParams = (item: BusinessEvent, network: NETWORK_TYPE, params: Record<string, string>) => {
    return {
        ...item,
        events: item.events.map(evt => ({
            ...evt,
            conditions: evt.conditions.map(condition => ({
                ...condition,
                firstOperand: substituteString(condition.firstOperand, network, params),
                secondOperand: substituteString(condition.secondOperand, network, params),
            })),
        })),
    } satisfies BusinessEvent
}

export class BusinessEventAbiManager extends AbiManager {
    constructor(protected readonly network: NETWORK_TYPE, protected readonly params?: Record<string, string>) {
        super()
    }

    protected _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[] {
        const entries = Object.entries(businessEvents)
        const mappedEntries = entries.map(([signature, item]) => {
            const parsedItem = replaceItemWithParams(item, this.network, this.params ?? {})
            return {
                name: parsedItem.name,
                fullSignature: signature,
                decode(_, __, prevEvents, origin) {
                    try {
                        return convertEventResultAliasRecordIntoParams(
                            decodeEventFn(prevEvents, parsedItem, origin),
                            item,
                            origin,
                        )
                    } catch {
                        return undefined
                    }
                },
            } satisfies IndexableAbi
        })
        return mappedEntries.sort(
            (a, b) => defaultSorting.indexOf(a.fullSignature as any) - defaultSorting.indexOf(b.fullSignature as any),
        )
    }
    protected _parseEvents(_output: Output, prevEvents: EventResult[], origin: string): EventResult[] {
        this.assertEventsLoaded()
        const found = this.indexableAbis.reduce((acc, curr) => {
            if (acc) return acc
            const decoded = curr.decode(undefined, undefined, prevEvents, origin)
            if (decoded !== undefined) return { fullSignature: curr.fullSignature, decoded }
        }, undefined as { decoded: { [key: string]: unknown }; fullSignature: string } | undefined)
        if (!found) return prevEvents
        return [{ name: found.fullSignature, params: found.decoded }]
    }
}
