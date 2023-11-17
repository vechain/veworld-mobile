import { useCallback, useState } from "react"

/**
 * hook to handle the amount input, filtering out non-numeric characters and duplicate decimal separators
 */
// TODO (Davide) (https://github.com/vechainfoundation/veworld-mobile/issues/751) integrate use amount input with multi decimals and mix it with formatUtils
export const useAmountInput = (initialValue: string = "") => {
    const [input, setInput] = useState(initialValue)

    const handleChangeInput = useCallback((text: string) => {
        const filteredText = text
            .replace(",", ".") // Replace comma with dot
            .replace(new RegExp("[^\\d\\.]", "g"), "") // Filter out non-numeric characters except for decimal separator
            .replace(new RegExp("\\.(?=.*\\.)", "g"), "") // Filter out duplicate decimal separators
        setInput(filteredText)
    }, [])

    return { input, setInput: handleChangeInput }
}
