import { EventResult } from "../AbiManager"
import { Condition } from "./condition"
import { BusinessEventRule } from "./rule"

export type BusinessEventWithConditions = {
    name: string
    alias: string
    conditions: Condition[] | readonly Condition[]
}

export type ParamsDefinition = {
    name: string
    eventName: string
    businessEventName: string
}

export type BusinessEvent = {
    name: string
    events: BusinessEventWithConditions[] | readonly BusinessEventWithConditions[]
    rules: BusinessEventRule[] | readonly BusinessEventRule[]
    paramsDefinition: ParamsDefinition[] | readonly ParamsDefinition[]
    checkAllCombinations?: boolean
}

export type EventResultWithAlias = EventResult & { alias: string }
