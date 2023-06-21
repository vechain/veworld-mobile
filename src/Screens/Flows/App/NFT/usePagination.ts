import { useCallback, useRef } from "react"
import { selectBlackListedCollections, useAppSelector } from "~Storage/Redux"

export const usePagination = () => {
    const counter = useRef(0)
    const blackListedCollections = useAppSelector(selectBlackListedCollections)

    const fetchWithPagination = useCallback(
        (
            totalElements: number,
            totalElementsReceived: number = 0,
            isLoading: boolean,
            cb: (page: number) => void,
        ) => {
            if (isLoading) return

            const presentedElements =
                totalElementsReceived + blackListedCollections.length

            if (presentedElements >= totalElements) {
                return
            }

            counter.current += 1

            cb(counter.current)
        },
        [blackListedCollections.length],
    )

    return { fetchWithPagination }
}
