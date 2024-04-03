import { useCallback } from "react"
import { PaginationResponse } from "~Networking"

export const usePagination = () => {
    const fetchWithPagination = useCallback(
        async (
            pagination: PaginationResponse,
            totalReceived: number,
            pageSize: number,
            cb: (page: number) => Promise<void>,
        ) => {
            if (!pagination.hasNext) return
            await cb(totalReceived / pageSize)
        },
        [],
    )

    return { fetchWithPagination }
}
