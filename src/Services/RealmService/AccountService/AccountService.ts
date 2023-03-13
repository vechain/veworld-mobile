import { Account, getUserPreferences } from "../../../Storage/Realm"

export const setSelectedAccount =
    (store: Realm) =>
    ({
        account,
        accountNotInitiated = false,
        alreadyInWriteTransaction = false,
    }: {
        account: Account
        accountNotInitiated?: boolean
        alreadyInWriteTransaction?: boolean
    }) => {
        const userPreferencesEntity = getUserPreferences(store)
        if (accountNotInitiated && userPreferencesEntity.selectedAccount) return
        if (!alreadyInWriteTransaction)
            store.write(() => {
                userPreferencesEntity.selectedAccount = account
            })
        else userPreferencesEntity.selectedAccount = account
    }
