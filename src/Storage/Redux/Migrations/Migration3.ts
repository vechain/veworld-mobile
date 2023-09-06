import { SessionTypes } from "@walletconnect/types"
import { Verify } from "@walletconnect/types/dist/types/core/verify"
import { PersistedState } from "redux-persist/es/types"
import { debug } from "~Utils"

type ConnectedApp = {
    session: SessionTypes.Struct
    verifyContext: Verify.Context
}

type NewState = Record<string, Array<ConnectedApp>>

type OldState = Record<string, Array<SessionTypes.Struct>>

/**
 * Migration 3: Previously, sessions were stored as an array of sessions per account
 * - Now connected apps are stored with their verify context
 */

export const Migration3 = (state: PersistedState): PersistedState => {
    debug("Performing migration 3")

    // @ts-ignore
    const currentState: OldState = state.sessions

    //We don't have any state, so return immediately
    if (Object.keys(currentState).length === 0) {
        return state
    }

    const addresses = Object.keys(currentState)
    const newState: NewState = {}

    for (const address of addresses) {
        const connectedApps = currentState[address]
        newState[address] = []

        for (const sessionOrApp of connectedApps) {
            if ("verifyContext" in sessionOrApp && "session" in sessionOrApp) {
                //Already migrated, so return current state
                return state
            }

            newState[address].push({
                session: sessionOrApp,
                verifyContext: {
                    verified: {
                        origin: sessionOrApp.peer.metadata.url,
                        validation: "VALID",
                        verifyUrl:
                            sessionOrApp.peer.metadata.verifyUrl ||
                            "https://verify.walletconnect.com",
                    },
                },
            })
        }
    }

    return {
        ...state,
        sessions: newState,
    } as PersistedState
}
