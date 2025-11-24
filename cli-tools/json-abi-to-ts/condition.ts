export type Condition = {
    firstOperand: string | number
    isFirstStatic: boolean
    secondOperand: string | number
    isSecondStatic: boolean
    operator: string
}

export type Event = {
    name: string
    alias: string
    conditions: Condition[]
}

export class ConditionValidator {
    constructor(
        private readonly event: Event,
        private readonly foundMatchingEvent: unknown,
        private readonly config: { pathName: string },
    ) {}

    validate() {
        for (const condition of this.event.conditions) {
            this.validateConditionOperands(condition)
            this.validateConditionValues(condition, "firstOperand")
            this.validateConditionValues(condition, "secondOperand")
        }
    }

    private validateConditionOperands(condition: Condition) {
        if (
            (typeof condition.firstOperand === "number" || /^\d+$/.test(condition.firstOperand)) &&
            !condition.isFirstStatic
        )
            throw new Error(
                // eslint-disable-next-line max-len
                `[BusinessEventValidator]: Error at ${this.config.pathName} -> ${this.event.alias}.\nFirst operand is a number but isFirstStatic is set to false.`,
            )
        if (
            (typeof condition.secondOperand === "number" || /^\d+$/.test(condition.secondOperand)) &&
            !condition.isSecondStatic
        )
            throw new Error(
                // eslint-disable-next-line max-len
                `[BusinessEventValidator]: Error at ${this.config.pathName} -> ${this.event.alias}.\nSecond operand is a number but isSecondStatic is set to false.`,
            )
    }

    private validateConditionValues(condition: Condition, key: "firstOperand" | "secondOperand") {
        if (key === "firstOperand" && condition.isFirstStatic) return
        if (key === "secondOperand" && condition.isSecondStatic) return
        // Special keywords
        if (["origin", "address"].includes(condition[key] as string)) return
        if (!(this.foundMatchingEvent as any).inputs.find((input: any) => input.name === condition[key]))
            throw new Error(
                // eslint-disable-next-line max-len
                `[BusinessEventValidator]: Error at ${this.config.pathName} -> ${this.event.alias} -> ${key}.\nEvent parameter was not found in the matching event.`,
            )
    }
}
