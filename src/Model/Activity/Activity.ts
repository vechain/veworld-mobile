import { DIRECTIONS } from "~Common"
import { Certificate } from "thor-devkit"
import { ActivityStatus, ActivityType } from "./enum"

export type OutputResponse = {
    contractAddress: string
    events: Connex.VM.Event[]
    transfers: Connex.VM.Transfer[]
}

/**
 * The Activity interface represents a blockchain activity with necessary transaction metadata.
 */
export interface Activity {
    from: string
    to?: string[]
    id: string
    blockNumber: number
    isTransaction: boolean
    genesisId: string
    type: ActivityType
    timestamp: number
    gasUsed: number
    gasPayer: string
    delegated: boolean
    status: ActivityStatus
    clauses: Connex.VM.Clause[]
    outputs: OutputResponse[]
}

/**
 * The FungibleTokenActivity interface represents a blockchain activity specifically for fungible token transactions.
 */
export interface FungibleTokenActivity extends Activity {
    amount: string | number
    tokenAddress: string
    type: ActivityType.FUNGIBLE_TOKEN | ActivityType.VET_TRANSFER
    direction: DIRECTIONS
}

/**
 * The ConnectedAppTxActivity interface represents a blockchain activity related to transactions from connected applications.
 */
export interface ConnectedAppTxActivity extends Activity {
    type: ActivityType.CONNECTED_APP_TRANSACTION
    linkUrl?: string
}

/**
 * The SignCertActivity interface represents a blockchain activity related to certificate signings.
 */
export interface SignCertActivity extends Activity {
    type: ActivityType.SIGN_CERT
    certMessage?: Connex.Vendor.CertMessage
    certOptions?: Connex.Driver.TxOptions
    certificate: Certificate
    linkUrl?: string
}

/**
 * The DelegatedTransactionActivity interface represents a blockchain activity related to delegated transactions.
 */
export interface DelegatedTransactionActivity extends Activity {
    type: ActivityType.DELEGATED_TRANSACTION
}
