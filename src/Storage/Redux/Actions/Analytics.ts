import { AppThunk } from "../Types"
import { setScreen } from "../Slices/Analytics"

const setCurrentMountedScreen =
    (screen: string): AppThunk =>
    dispatch => {
        dispatch(setScreen(screen))
    }

export { setCurrentMountedScreen }
