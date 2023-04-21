import { TransactionOutcomes } from "~Model/Transaction"
import { DIRECTIONS } from "~Common"
import { Certificate } from "thor-devkit"
import { ActivityStatus, ActivityType } from "./enum"

/**
 * A model for fungible token transfer activities that occur on this wallet
 * @field `amount` - the number of tokens transfered
 * @field `token` - the fungible token transfered
 * @field `type` - the type of activity - VET_TRANSFER for native coin VET and FUNGIBLE_TOKEN otherwise
 */
export interface FungibleTokenActivity extends Activity {
    amount: string | number
    tokenAddress: string
    type: ActivityType.FUNGIBLE_TOKEN | ActivityType.VET_TRANSFER
    direction: DIRECTIONS
}

/**
 * A base activity model
 * @field `from` - the address that this activity originated from
 * @field `to` - the target of this activity
 * @field `id` - May be the ID of the transaction or the ID of the activity
 * @field `network` - the network that this activity happened on
 * @field `type` - the type of activity
 * @field `timestamp` - The time that the activity was created
 * @field `transaction` - The transaction details. This should be immediately available after sending
 * @field `txReceipt` - The transaction receipt. This should be available after the transaction is mined
 * @field `status` - The current status of the activity
 * @field `finality` - Whether the activity is final or not
 */
export interface Activity {
    from: string
    to?: string[]
    id: string
    isTransaction: boolean
    genesisId: string
    type: ActivityType
    timestamp?: number
    transaction?: Connex.Thor.Transaction | null
    txReceipt?: Connex.Thor.Transaction.Receipt | null
    status: ActivityStatus
    finality?: boolean
}

/**
 * A model for ConnectedApp transaction activities that occur on this wallet
 * @field `clauseMetadata` - the clauses created based off the transaction details
 * @field `type` - the type of activity - always ActivityType.CONNECTED_APP_TRANSACTION
 */
export interface ConnectedAppTxActivity extends Activity {
    clauseMetadata: TransactionOutcomes
    type: ActivityType.CONNECTED_APP_TRANSACTION
    delegated?: boolean
    txMessage: Connex.Vendor.TxMessage
    txOptions?: Connex.Driver.TxOptions
    linkUrl?: string
    sender: string
}

export interface SignCertActivity extends Activity {
    type: ActivityType.SIGN_CERT
    certMessage?: Connex.Vendor.CertMessage
    certOptions?: Connex.Driver.TxOptions
    certificate: Certificate
    linkUrl?: string
    sender: string
}

export interface DelegatedTransactionActivity extends Activity {
    type: ActivityType.DELEGATED_TRANSACTION
}
