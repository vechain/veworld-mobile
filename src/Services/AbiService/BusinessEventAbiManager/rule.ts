import { evaluateOperator, Operator } from "./operator"
import { EventResultWithAlias } from "./types"
import { getEventValue } from "./utils"

export type BusinessEventRule = {
    firstEventName: string
    firstEventProperty: string
    secondEventName: string
    secondEventProperty: string
    operator: Operator
}

export const matchesRulesSingle = (
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
