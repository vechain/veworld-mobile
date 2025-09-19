import { AddressUtils } from "~Utils"
import { AppThunk } from "../Types"
import { deleteExternalDappSession } from "../Slices/ExternalDapps"
import { decodeBase64 } from "tweetnacl-util"
import nacl from "tweetnacl"
import { SessionData } from "~Components/Providers/DeepLinksProvider/types"

const isValidSession =
    (
        genesisId: string,
        publicKey: string,
        session: string,
        onSwitchAccount: (address: string) => void,
    ): AppThunk<boolean> =>
    (dispatch, getState) => {
        const {
            externalDapps: externalDappsState,
            userPreferences: userPreferencesState,
            accounts: accountsState,
        } = getState()
        const signKeyPair = userPreferencesState.signKeyPair

        if (!signKeyPair) {
            return false
        }

        const sessionKeyPair = nacl.sign.keyPair.fromSecretKey(decodeBase64(signKeyPair.privateKey))
        const decryptedSession = nacl.sign.open(decodeBase64(session), sessionKeyPair.publicKey)

        if (!decryptedSession) {
            return false
        }

        const sessionData = JSON.parse(new TextDecoder().decode(decryptedSession)) as SessionData

        const dappSession = externalDappsState.sessions[genesisId][publicKey]

        if (!dappSession) {
            return false
        }

        const account = accountsState.accounts.find(acct =>
            AddressUtils.compareAddresses(acct.address, dappSession.address),
        )

        //If doesnt exist an account for the current session, delete the session
        if (!account) {
            dispatch(deleteExternalDappSession({ genesisId, appPublicKey: publicKey }))
            return false
        }

        //If the account is not the same as the session, switch to the new account
        if (
            accountsState.selectedAccount &&
            !AddressUtils.compareAddresses(accountsState.selectedAccount, sessionData.address)
        ) {
            //Switch to the new account
            onSwitchAccount(sessionData.address)
            return true
        }

        return true
    }

export { isValidSession }
