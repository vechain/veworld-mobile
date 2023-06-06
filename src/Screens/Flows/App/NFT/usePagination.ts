import { useCallback, useRef } from "react"

export const usePagination = () => {
    const counter = useRef(0)

    const fetchwithPagination = useCallback(
        (
            totalElements: number,
            totalElementsReceived: number,
            cb: (page: number) => void,
        ) => {
            counter.current += 1
            if (totalElements === totalElementsReceived) return
            cb(counter.current)
        },
        [counter],
    )

    return { fetchwithPagination }
}
