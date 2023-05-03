import { useCallback, useState } from "react"
/**
 *  A custom hook to manage a counter state
 * @returns a counter object with count, increment, decrement and reset functions
 */
export const useCounter = () => {
    const [count, setCount] = useState(0)

    const increment = useCallback(() => setCount(curr => curr + 1), [])
    const decrement = useCallback(() => setCount(curr => curr - 1), [])

    const reset = useCallback(() => setCount(0), [])

    return {
        count,
        increment,
        decrement,
        reset,
    }
}
