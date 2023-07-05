import { resetActions } from "~Storage/Redux"
import { AppThunk } from "~Storage/Redux/Types"
import { error } from "~Utils"

/**
 * Asynchronous Redux thunk that resets all the actions in the application.
 * This function is particularly useful to reset all application state to its initial conditions.
 *
 * @returns A `Promise` that resolves with a `boolean` value indicating the success of the operation.
 */
export const resetApp = (): AppThunk<Promise<boolean>> => async dispatch => {
    try {
        resetActions.forEach(resetAction => {
            dispatch(resetAction())
        })

        return Promise.resolve(true)
    } catch (e) {
        error("Failed to reset the application state")
        return Promise.resolve(false)
    }
}
