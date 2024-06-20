import { useEffect, useRef } from "react"

type Props = {
    callback: () => void
    delay: number | null
    enabled?: boolean
}

export const useInterval = ({ callback, delay, enabled = true }: Props) => {
    const savedCallback = useRef<() => void>()

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        if (!enabled) return

        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current()
            }
        }

        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay, enabled])
}
