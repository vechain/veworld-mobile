import { AppThunk } from "../Types"
import { deleteSession, insertSession } from "../Slices"
import { ISession } from "@walletconnect/types"

const addSession =
    (session: ISession): AppThunk<ISession> =>
    dispatch => {
        dispatch(insertSession(session))

        return session
    }

const removeSession =
    (topic: string): AppThunk =>
    dispatch => {
        dispatch(deleteSession({ topic: topic }))
    }

export { addSession, removeSession }
