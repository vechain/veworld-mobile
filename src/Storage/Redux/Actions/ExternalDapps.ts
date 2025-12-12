import nacl from "tweetnacl"
import { decodeBase64 } from "tweetnacl-util"
import { showInfoToast } from "~Components"
import { SessionData } from "~Components/Providers/DeepLinksProvider/types"
import { TranslationFunctions } from "~i18n/i18n-types"
import { AddressUtils } from "~Utils"
import { selectExternalDappSessions } from "../Selectors/ExternalDapp"
import { selectNetworks, selectSelectedNetwork } from "../Selectors/Network"
import { deleteExternalDappSession, SessionState } from "../Slices/ExternalDapps"
import { AppThunk } from "../Types"
import { switchActiveNetwork } from "./Network"

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

const switchNetwork =
    (genesisId: string, LL: TranslationFunctions): AppThunk<Record<string, SessionState> | undefined> =>
    (dispatch, getState) => {
        const state = getState()
        const networks = selectNetworks(state)
        const selectedNetwork = selectSelectedNetwork(state)
        const externalDapps = selectExternalDappSessions(state, selectedNetwork.genesis.id)

        if (selectedNetwork.genesis.id === genesisId) {
            return externalDapps
        }

        const network = networks.find(n => n.genesis.id === genesisId)
        if (!network) {
            return
        }

        showInfoToast({
            text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                network: network.name,
            }),
        })

        dispatch(switchActiveNetwork(network))

        return selectExternalDappSessions(state, network.genesis.id)
    }

export { isValidSession, switchNetwork }
