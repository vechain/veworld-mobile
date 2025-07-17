import { ethers } from "ethers"

export type Operator = "EQ" | "NE" | "GT" | "LT" | "GE" | "LE"

export const evaluateOperator = (operator: Operator, firstValue: string, secondValue: string) => {
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
