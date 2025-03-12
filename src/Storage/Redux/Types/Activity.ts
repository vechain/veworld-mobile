import { Activity } from "~Model"

export interface AccountActivities {
    //Activities that involve a transaction on-chain
    transactionActivitiesMainnet: Activity[]
    transactionActivitiesTestnet: Activity[]
    //Activities that don't involve a transaction on-chain, thus no differentiating between mainnet and testnet
    nonTransactionActivities: Activity[]
}

export interface ActivityState {
    activities: Activity[]
}
