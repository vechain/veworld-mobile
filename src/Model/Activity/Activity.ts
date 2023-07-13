import { DIRECTIONS } from "~Constants"
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
    isTransaction: boolean
    timestamp: number
    type: ActivityType
    id: string
    from: string
    to?: string[]
    blockNumber?: number
    genesisId?: string
    status?: ActivityStatus
    clauses?: Connex.VM.Clause[]
    gasUsed?: number
    gasPayer?: string
    delegated?: boolean
    outputs?: OutputResponse[]
}

export interface NonTransactionalActivity {
    type: ActivityType.CONNECTED_APP_TRANSACTION | ActivityType.SIGN_CERT
    timestamp: number
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
 * The NonFungibleTokenActivity interface represents a blockchain activity specifically for non-fungible token transactions.
 */
export interface NonFungibleTokenActivity extends Activity {
    tokenId: string
    contractAddress: string
    type: ActivityType.NFT_TRANSFER
    direction: DIRECTIONS
}

/**
 * The DappTxActivity interface represents a blockchain activity related to transactions from connected applications.
 */
export interface DappTxActivity extends Activity {
    type: ActivityType.DAPP_TRANSACTION
    name?: string
    linkUrl?: string
}

/**
 * The ConnectedAppActivity interface represents a blockchain activity related to transactions from connected applications.
 */
export interface ConnectedAppActivity extends Activity {
    type: ActivityType.CONNECTED_APP_TRANSACTION
    name?: string
    linkUrl?: string
    description?: string
    methods?: string[]
}

/**
 * The SignCertActivity interface represents a blockchain activity related to certificate signings.
 */
export interface SignCertActivity extends Activity {
    type: ActivityType.SIGN_CERT
    name?: string
    content?: string
    purpose?: string
    linkUrl?: string
}

/**
 * The DelegatedTransactionActivity interface represents a blockchain activity related to delegated transactions.
 */
export interface DelegatedTransactionActivity extends Activity {
    type: ActivityType.DELEGATED_TRANSACTION
}
