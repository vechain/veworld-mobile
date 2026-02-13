import { useEffect, useRef } from "react"
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

export const usePreviousWithInitialValue = <T, TInitialValue extends T>(
    elem: T,
    initialValue?: TInitialValue,
): undefined extends TInitialValue ? T | undefined : T => {
    const ref = useRef<T | undefined>(initialValue)
    useEffect(() => {
        ref.current = elem
    }, [elem])
    return ref.current as T
}
