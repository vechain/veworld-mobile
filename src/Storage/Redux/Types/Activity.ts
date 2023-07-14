import { Activity } from "~Model"

export interface AccountActivities {
    transactionActivitiesMainnet: Activity[] //Activities that involve a transaction on-chain
    transactionActivitiesTestnet: Activity[]
    nonTransactionActivities: Activity[] //Activities that don't involve a transaction on-chain, thus no differentiating between mainnet and testnet
}
