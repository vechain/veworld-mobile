import { useCallback, useEffect, useRef, useState } from "react"
import { WithID, MetadataUpdated } from "~Model"
import { debug, error } from "~Utils"

const MAX_RETRIES = 10

type Props<T> = {
    payload: T[]
    loader: (payload: T) => Promise<void>
}

export const useLazyLoader = <T extends WithID & MetadataUpdated>({
    payload,
    loader,
}: Props<T>) => {
    const [triggerRefresh, setTriggerRefresh] = useState(0)
    const metadataLoading = useRef(
        new Map<string, { isLoading: boolean; count: number }>(),
    )

    const triggerLoader = useCallback(
        async (item: T) => {
            if (item.updated) return
            debug("Attempting lazy load")
            const loadingStatus = metadataLoading.current.get(item.id)
            if (
                loadingStatus &&
                (loadingStatus.isLoading || loadingStatus.count > MAX_RETRIES)
            ) {
                debug(
                    `Exiting early loading status: ${JSON.stringify(
                        loadingStatus,
                    )}`,
                )
                return
            }
            const newStatus = {
                isLoading: true,
                count: (loadingStatus?.count ?? 0) + 1,
            }
            try {
                metadataLoading.current.set(item.id, newStatus)

                await loader(item)

                metadataLoading.current.set(item.id, {
                    isLoading: false,
                    count: 0,
                })
            } catch (e: unknown) {
                metadataLoading.current.set(item.id, {
                    isLoading: false,
                    count: newStatus.count,
                })
                error("lazyLoadMetadata", e)
            }
        },
        [loader],
    )

    // Trigger lazy loading of metadata
    useEffect(() => {
        // Try to get metadata for collections that don't have it
        payload.forEach(p => {
            triggerLoader(p)
        })
    }, [payload, triggerRefresh, triggerLoader])

    // Trigger a metadata refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setTriggerRefresh(Date.now())
        }, 30000)
        return () => clearInterval(interval)
    }, [])
}
