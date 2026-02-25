import { useCallback, useEffect, useRef, useState } from "react"

type PendingAction<TRef> = (ref: TRef) => void

export const useDeferredRefAction = <TRef>() => {
    const ref = useRef<TRef | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [pendingAction, setPendingAction] = useState<PendingAction<TRef> | null>(null)

    const setNodeRef = useCallback((node: TRef | null) => {
        ref.current = node
        setIsReady(!!node)
    }, [])

    const runWhenReady = useCallback((action: PendingAction<TRef>) => {
        if (ref.current) {
            action(ref.current)
            return
        }
        setPendingAction(() => action)
    }, [])

    useEffect(() => {
        if (!isReady || !ref.current || !pendingAction) return
        pendingAction(ref.current)
        setPendingAction(null)
    }, [isReady, pendingAction])

    return { ref, setNodeRef, runWhenReady, isReady }
}
