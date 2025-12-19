import { Account } from "~Model"
import { ContactType } from "./enum"

export interface Contact extends Account {
    type: ContactType
    vnsName?: string
}

export type RecentContact = { address: string; alias?: string; timestamp: number }
