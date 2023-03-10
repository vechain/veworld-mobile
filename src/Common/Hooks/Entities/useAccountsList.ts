import { Account, useListListener, useRealm } from "~Storage"

export const useAccountsList = (query?: string) => {
    const { store } = useRealm()

    const accounts = useListListener(
        Account.getName(),
        store,
        query,
    ) as Account[]

    return accounts
}
