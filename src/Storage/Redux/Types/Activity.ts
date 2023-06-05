import { Activity } from "~Model"

export interface AccountActivities {
    transactionActivitiesMainnet: Activity[] //Activities that involve a transaction on-chain
    nonTransactionActivitiesMainnet: Activity[] //Activities that do not involve a transaction on-chain
    transactionActivitiesTestnet: Activity[]
    nonTransactionActivitiesTestnet: Activity[]
}
