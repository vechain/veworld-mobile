import { useMemo } from "react"
import { AppStateType } from "~Model"
import { useAppState } from "./useAppState"

export const useAppStateTransitions = () => {
    const [previousState, currentState] = useAppState()

    const activeToBackground = useMemo(
        () =>
            currentState === AppStateType.BACKGROUND &&
            previousState === AppStateType.ACTIVE,
        [currentState, previousState],
    )

    const backgroundToActive = useMemo(
        () =>
            currentState === AppStateType.ACTIVE &&
            previousState === AppStateType.BACKGROUND,
        [currentState, previousState],
    )

    const closedToActive = useMemo(
        () =>
            currentState === AppStateType.ACTIVE &&
            previousState === AppStateType.UNKNOWN,
        [currentState, previousState],
    )

    return {
        activeToBackground,
        backgroundToActive,
        closedToActive,
    }
}
