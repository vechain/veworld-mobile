import { useCallback } from "react"
import { PaginationResponse } from "~Networking"
import { debug } from "~Utils"

export const usePagination = () => {
    const fetchWithPagination = useCallback(
        async (
            pagination: PaginationResponse,
            totalReceived: number,
            pageSize: number,
            cb: (page: number) => Promise<void>,
        ) => {
            debug(
                `totalElements: ${pagination?.totalElements}, totalReceived: ${totalReceived}, pageSize: ${pageSize}`,
            )

            if (
                totalReceived >= pagination?.totalElements ||
                totalReceived % pageSize !== 0
            )
                return

            await cb(totalReceived / pageSize)
        },
        [],
    )

    return { fetchWithPagination }
}
