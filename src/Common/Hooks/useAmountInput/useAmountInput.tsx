import { useState } from "react"
import { getNumberFormatSettings } from "react-native-localize"

export const useAmountInput = (initialValue: string = "") => {
    const { decimalSeparator } = getNumberFormatSettings()
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
