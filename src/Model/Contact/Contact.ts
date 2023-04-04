import { Account } from "~Model"
import { ContactType } from "./enum"

export interface Contact extends Account {
    type: ContactType
}
