import { AppStateStatus } from "react-native"

export type AppState = {
    currentState: AppStateStatus
    previousState: AppStateStatus
}
