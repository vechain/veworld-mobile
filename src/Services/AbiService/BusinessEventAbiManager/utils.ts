import { EventResult } from "../AbiManager"

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
export const getEventValue = (event: EventResult, operand: string, originValue: string) => {
    if (operand === "address") return event.address?.toLowerCase() ?? ""
    if (operand === "origin") return originValue.toLowerCase()
    assertToStringable(event.params[operand])
    return event.params[operand].toString().toLowerCase().trim()
}

export const resolveOperandValue = (
    operand: string | number,
    isStatic: boolean,
    event: EventResult,
    originValue: string,
) => {
    if (isStatic) return operand.toString().toLowerCase().trim()
    if (typeof operand === "number") throw new Error("[BusinessEventValidator]: Invalid operand")
    return getEventValue(event, operand, originValue)
}
