import { useCallback, useMemo } from "react"
import { Account, useObjectListener, useRealm, UserPreferences } from "~Storage"

export const useUserPreferencesEntity = () => {
    const { store } = useRealm()

    const userPreferencesEntity = useObjectListener(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
        store,
    ) as UserPreferences

    const currentNetwork = useMemo(
        () => userPreferencesEntity?.currentNetwork,
        [userPreferencesEntity?.currentNetwork],
    )

    const isAppLockActive = useMemo(
        () => userPreferencesEntity?.isAppLockActive,
        [userPreferencesEntity?.isAppLockActive],
    )

    const theme = useMemo(
        () => userPreferencesEntity?.theme,
        [userPreferencesEntity?.theme],
    )

    const selectedAccount = useMemo(
        () => userPreferencesEntity?.selectedAccount,
        [userPreferencesEntity?.selectedAccount],
    )

    const balanceVisible = useMemo(
        () => userPreferencesEntity?.balanceVisible,
        [userPreferencesEntity?.balanceVisible],
    )

    const setSelectedAccount = useCallback(
        ({
            account,
            onlyIfNotSetted = false,
            alreadyInWriteTransaction = false,
        }: {
            account: Account
            onlyIfNotSetted?: boolean
            alreadyInWriteTransaction?: boolean
        }) => {
            if (onlyIfNotSetted && userPreferencesEntity.selectedAccount) return
            if (!alreadyInWriteTransaction)
                store.write(() => {
                    userPreferencesEntity.selectedAccount = account
                })
            else userPreferencesEntity.selectedAccount = account
        },
        [userPreferencesEntity, store],
    )

    return {
        isAppLockActive,
        currentNetwork,
        theme,
        selectedAccount,
        balanceVisible,
        userPreferencesEntity,
        setSelectedAccount,
    }
}
