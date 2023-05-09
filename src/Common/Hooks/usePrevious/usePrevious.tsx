import { useRef, useEffect } from "react"
/**
 *
 * @param elem
 * @returns previous value of `elem`
 */
export const usePrevious = <T,>(elem: T): T | undefined => {
    const ref = useRef<T>()
    useEffect(() => {
        ref.current = elem
    }, [elem])
    return ref.current
}
