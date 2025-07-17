import { EventResult } from "../AbiManager"
import { evaluateOperator, Operator } from "./operator"
import { resolveOperandValue } from "./utils"

export type Condition = {
    firstOperand: string | number
    isFirstStatic: boolean
    secondOperand: string | number
    isSecondStatic: boolean
    operator: Operator
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

export const matchesConditions = (
    results: EventResult[],
    conditions: Condition[] | readonly Condition[],
    originValue: string,
) => {
    return results.filter(result => matchesConditionsSingle(result, conditions, originValue))
}
