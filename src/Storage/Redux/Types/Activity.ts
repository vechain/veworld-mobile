import { Activity } from "~Model"

export interface AccountActivities {
    transactionActivities: Activity[] //Activities that involve a transaction on-chain
    nonTransactionActivities: Activity[] //Activities that do not involve a transaction on-chain
}
