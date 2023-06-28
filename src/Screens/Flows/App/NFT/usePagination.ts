import { useCallback, useRef } from "react"

export const usePagination = (startPage: number = 0) => {
    const counter = useRef(startPage)

    const fetchWithPagination = useCallback(
        (
            totalElements: number,
            totalElementsReceived: number = 0,
            isLoading: boolean,
            cb: (page: number) => void,
            blackListedCollections?: number,
        ) => {
            if (isLoading) return

            const presentedElements = blackListedCollections
                ? totalElementsReceived + blackListedCollections
                : totalElementsReceived

            if (presentedElements >= totalElements) {
                return
            }

            counter.current += 1

            cb(counter.current)
        },
        [],
    )

    return { fetchWithPagination }
}
