import { Account, useListListener, useRealm } from "~Storage"

export const useAccountsList = () => {
    const { store } = useRealm()

    const accounts = useListListener(Account.getName(), store) as Account[]

    return accounts
}
