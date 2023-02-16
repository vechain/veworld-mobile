import { useMemo } from "react"
import { AppStateType } from "~Model"
import { useAppState } from "./useAppState"

export const useAppStateTransitions = () => {
    const [previousState, currentState] = useAppState()

    const activeToBackground = useMemo(
        () =>
            previousState === AppStateType.ACTIVE &&
            currentState === AppStateType.BACKGROUND,
        [currentState, previousState],
    )

    const backgroundToActive = useMemo(
        () =>
            previousState === AppStateType.BACKGROUND &&
            currentState === AppStateType.ACTIVE,
        [currentState, previousState],
    )

    const closedToActive = useMemo(
        () =>
            previousState === AppStateType.UNKNOWN &&
            currentState === AppStateType.ACTIVE,
        [currentState, previousState],
    )

    const inactiveToBackground = useMemo(
        () =>
            previousState === AppStateType.INACTIVE &&
            currentState === AppStateType.BACKGROUND,
        [currentState, previousState],
    )

    return {
        activeToBackground,
        backgroundToActive,
        closedToActive,
        inactiveToBackground,
    }
}
