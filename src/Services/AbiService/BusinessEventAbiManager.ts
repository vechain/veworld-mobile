import { Output } from "@vechain/sdk-network"
import { AbiManager, EventResult, IndexableAbi } from "./AbiManager"
import business_events_generated from "./business_events_generated"
import { ethers } from "ethers"
import { NETWORK_TYPE } from "~Model"

type Operator = "EQ" | "NE" | "GT" | "LT" | "GE" | "LE"

type Condition = {
    firstOperand: string | number
    isFirstStatic: boolean
    secondOperand: string | number
    isSecondStatic: boolean
    operator: Operator
}

type BusinessEventWithConditions = {
    name: string
    alias: string
    conditions: Condition[] | readonly Condition[]
}

type BusinessEventRule = {
    firstEventName: string
    firstEventProperty: string
    secondEventName: string
    secondEventProperty: string
    operator: Operator
}

type ParamsDefinition = {
    name: string
    eventName: string
    businessEventName: string
}

type BusinessEvent = {
    name: string
    events: BusinessEventWithConditions[] | readonly BusinessEventWithConditions[]
    rules: BusinessEventRule[] | readonly BusinessEventRule[]
    paramsDefinition: ParamsDefinition[] | readonly ParamsDefinition[]
    checkAllCombinations?: boolean
}

type EventResultWithAlias = EventResult & { alias: string }

function cartesian<T extends any[]>(args: T[]) {
    let result: T[] = []
    let max = args.length - 1
    function helper(arr: T, i: number) {
        for (var j = 0, l = args[i].length; j < l; j++) {
            var a = arr.slice(0) // clone arr
            a.push(args[i][j])
            if (i === max) result.push(a as T)
            else helper(a as T, i + 1)
        }
    }
    helper([] as unknown as T, 0)
    return result
}

const convertEventResultWithAliasIntoRecord = (results: EventResultWithAlias[]): Record<string, EventResult> => {
    return Object.fromEntries(results.map(({ alias, ...event }) => [alias, event]))
}

function assertToStringable(value: unknown): asserts value is { toString(): string } {
    if (value === undefined) throw new Error("[assertToStringable]: Value is undefined")
    if (value === null) throw new Error("[assertToStringable]: Value is null")
}

/**
 *
 * @param event Event Result
 * @param operand Operand
 * @param originValue Value of `origin` from the transaction
 * @returns
 */
const getEventValue = (event: EventResult, operand: string, originValue: string) => {
    if (operand === "address") return event.address?.toLowerCase() ?? ""
    if (operand === "origin") return originValue.toLowerCase()
    assertToStringable(event.params[operand])
    return event.params[operand].toString().toLowerCase().trim()
}

const convertEventResultAliasRecordIntoParams = (
    record: Record<string, EventResult>,
    item: BusinessEvent,
    originValue: string,
) => {
    return Object.fromEntries(
        item.paramsDefinition.map(param => {
            const value = getEventValue(record[param.eventName], param.name, originValue)
            return [param.businessEventName, value]
        }),
    )
}

const evaluateOperator = (operator: Operator, firstValue: string, secondValue: string) => {
    switch (operator) {
        case "EQ":
            return firstValue === secondValue
        case "NE":
            return firstValue !== secondValue
        case "GT":
            return ethers.BigNumber.from(firstValue).gt(secondValue)
        case "LT":
            return ethers.BigNumber.from(firstValue).lt(secondValue)
        case "GE":
            return ethers.BigNumber.from(firstValue).gte(secondValue)
        case "LE":
            return ethers.BigNumber.from(firstValue).lte(secondValue)
    }
}

const resolveOperandValue = (operand: string | number, isStatic: boolean, event: EventResult, originValue: string) => {
    if (isStatic) return operand.toString().toLowerCase().trim()
    if (typeof operand === "number") throw new Error("[BusinessEventValidator]: Invalid operand")
    return getEventValue(event, operand, originValue)
}

const matchesConditionsSingle = (
    result: EventResult,
    conditions: Condition[] | readonly Condition[],
    originValue: string,
) => {
    return conditions.every(condition => {
        const firstValue = resolveOperandValue(condition.firstOperand, condition.isFirstStatic, result, originValue)
        const secondValue = resolveOperandValue(condition.secondOperand, condition.isSecondStatic, result, originValue)
        return evaluateOperator(condition.operator, firstValue, secondValue)
    })
}

const matchesConditions = (
    results: EventResult[],
    conditions: Condition[] | readonly Condition[],
    originValue: string,
) => {
    return results.filter(result => matchesConditionsSingle(result, conditions, originValue))
}

const matchesRulesSingle = (
    result: EventResultWithAlias[],
    rules: BusinessEventRule[] | readonly BusinessEventRule[],
    origin: string,
) => {
    return rules.every(rule => {
        const firstValue = getEventValue(
            result.find(evt => evt.alias === rule.firstEventName)!,
            rule.firstEventProperty,
            origin,
        )
        const secondValue = getEventValue(
            result.find(evt => evt.alias === rule.secondEventName)!,
            rule.secondEventProperty,
            origin,
        )
        return evaluateOperator(rule.operator, firstValue, secondValue)
    })
}

const decodeEventFn = (prevEvents: EventResult[], item: BusinessEvent, origin: string) => {
    let matchingEvents: Record<string, EventResult[]> = {}
    for (let i = 0; i < item.events.length; i++) {
        const itemEvent = item.events[i]
        const foundEvents = prevEvents.filter(evt => evt.name === itemEvent.name)
        if (foundEvents.length === 0) throw new Error("[BusinessEventValidator]: No matching events found")
        const eventsMatchingConditions = matchesConditions(foundEvents, itemEvent.conditions, origin)
        if (eventsMatchingConditions.length === 0)
            throw new Error("[BusinessEventValidator]: No events matching conditions found")
        matchingEvents[itemEvent.alias] = eventsMatchingConditions
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

const matchesEventFn = (prevEvents: EventResult[], item: BusinessEvent, origin: string) => {
    try {
        decodeEventFn(prevEvents, item, origin)
        return true
    } catch {
        return false
    }
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
        return Object.entries(business_events_generated).map(([signature, item]) => {
            const parsedItem = replaceItemWithParams(item, this.network, this.params ?? {})
            return {
                name: parsedItem.name,
                fullSignature: signature,
                isEvent(_, __, prevEvents, origin) {
                    return matchesEventFn(prevEvents, parsedItem, origin)
                },
                decode(_, __, prevEvents, origin) {
                    return convertEventResultAliasRecordIntoParams(
                        decodeEventFn(prevEvents, parsedItem, origin),
                        item,
                        origin,
                    )
                },
            }
        })
    }
    protected _parseEvents(_output: Output, prevEvents: EventResult[], origin: string): EventResult[] {
        this.assertEventsLoaded()
        const found = this.indexableAbis.find(abi => abi.isEvent(undefined, undefined, prevEvents, origin))
        if (!found) return prevEvents
        return [{ name: found.fullSignature, params: found.decode(undefined, undefined, prevEvents, origin) }]
    }
}
