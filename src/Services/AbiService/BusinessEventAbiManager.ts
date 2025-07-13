import { Output } from "@vechain/sdk-network"
import { AbiManager, EventResult, IndexableAbi } from "./AbiManager"
import business_events_generated from "./business_events_generated"
import { ethers } from "ethers"

type Operator = "EQ" | "NE" | "GT" | "LT" | "GE" | "LE"

type Condition = {
    firstOperand: string
    isFirstStatic: boolean
    secondOperand: string
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

const convertEventResultAliasRecordIntoParams = (record: Record<string, EventResult>, item: BusinessEvent) => {
    return Object.fromEntries(
        item.paramsDefinition.map(param => {
            const value = record[param.eventName].params[param.name]
            return [param.businessEventName, value]
        }),
    )
}

function assertToStringable(value: unknown): asserts value is { toString(): string } {
    if (value === undefined) throw new Error("[assertToStringable]: Value is undefined")
    if (value === null) throw new Error("[assertToStringable]: Value is null")
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

const getEventValue = (event: EventResult, operand: string) => {
    assertToStringable(event.params[operand])
    return event.params[operand].toString().toLowerCase().trim()
}

const resolveOperandValue = (operand: string, isStatic: boolean, event: EventResult) => {
    if (isStatic) return operand.toLowerCase().trim()
    return getEventValue(event, operand)
}

const matchesConditionsSingle = (result: EventResult, conditions: Condition[] | readonly Condition[]) => {
    return conditions.every(condition => {
        const firstValue = resolveOperandValue(condition.firstOperand, condition.isFirstStatic, result)
        const secondValue = resolveOperandValue(condition.secondOperand, condition.isSecondStatic, result)
        return evaluateOperator(condition.operator, firstValue, secondValue)
    })
}

const matchesConditions = (results: EventResult[], conditions: Condition[] | readonly Condition[]) => {
    return results.filter(result => matchesConditionsSingle(result, conditions))
}

const matchesRulesSingle = (
    result: EventResultWithAlias[],
    rules: BusinessEventRule[] | readonly BusinessEventRule[],
) => {
    return rules.every(rule => {
        const firstValue = getEventValue(
            result.find(evt => evt.alias === rule.firstEventName)!,
            rule.firstEventProperty,
        )
        const secondValue = getEventValue(
            result.find(evt => evt.alias === rule.secondEventName)!,
            rule.secondEventProperty,
        )
        return evaluateOperator(rule.operator, firstValue, secondValue)
    })
}

const decodeEventFn = (prevEvents: EventResult[], item: BusinessEvent) => {
    let matchingEvents: Record<string, EventResult[]> = {}
    for (let i = 0; i < item.events.length; i++) {
        const itemEvent = item.events[i]
        const foundEvents = prevEvents.filter(evt => evt.name === itemEvent.name)
        if (!foundEvents) throw new Error("[BusinessEventValidator]: No matching events found")
        const eventsMatchingConditions = matchesConditions(foundEvents, itemEvent.conditions)
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
            const matching = matchesRulesSingle(combination, item.rules)
            if (matching)
                return convertEventResultAliasRecordIntoParams(convertEventResultWithAliasIntoRecord(combination), item)
        }

        throw new Error("[BusinessEventValidator]: No matching rules found")
    }

    const parsedRules = Object.entries(matchingEvents).map(([alias, events]) => ({ ...events[0], alias }))
    const rulesMatching = matchesRulesSingle(parsedRules, item.rules)
    if (rulesMatching)
        return convertEventResultAliasRecordIntoParams(convertEventResultWithAliasIntoRecord(parsedRules), item)
    throw new Error("[BusinessEventValidator]: No matching rules found")
}

const matchesEventFn = (prevEvents: EventResult[], item: BusinessEvent) => {
    try {
        decodeEventFn(prevEvents, item)
        return true
    } catch {
        return false
    }
}

export class BusinessEventAbiManager extends AbiManager {
    protected _loadAbis(): Promise<IndexableAbi[]> | IndexableAbi[] {
        return Object.entries(business_events_generated).map(([signature, item]) => {
            return {
                name: item.name,
                fullSignature: signature,
                isEvent(_, __, prevEvents) {
                    return matchesEventFn(prevEvents, item)
                },
                decode(_, __, prevEvents) {
                    return decodeEventFn(prevEvents, item)
                },
            }
        })
    }
    protected _parseEvents(_output: Output, prevEvents: EventResult[]): EventResult[] {
        this.assertEventsLoaded()
        const found = this.indexableAbis.find(abi => abi.isEvent(undefined, undefined, prevEvents))
        if (!found) return prevEvents
        return [{ name: found.fullSignature, params: found.decode(undefined, undefined, prevEvents) }]
    }
}
