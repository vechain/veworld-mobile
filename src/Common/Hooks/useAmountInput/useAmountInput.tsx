import { useState } from "react"
import { useDecimalSeparator } from "../useDecimalSeparator"

/**
 * hook to handle the amount input, filtering out non-numeric characters and duplicate decimal separators
 */
export const useAmountInput = (initialValue: string = "") => {
    const decimalSeparator = useDecimalSeparator()
    const [input, setInput] = useState(initialValue)

    const handleChangeInput = (text: string) => {
        const filteredText = text
            .replace(new RegExp(`[^\\d\\${decimalSeparator}]`, "g"), "") // Filter out non-numeric characters except for decimal separator
            .replace(
                new RegExp(
                    `\\${decimalSeparator}(?=.*\\${decimalSeparator})`,
                    "g",
                ),
                "",
            ) // Filter out duplicate decimal separators

        setInput(filteredText)
    }

    return { input, setInput: handleChangeInput }
}
