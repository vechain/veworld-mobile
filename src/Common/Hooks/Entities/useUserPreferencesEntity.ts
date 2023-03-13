import { useMemo } from "react"
import { useObjectListener, useRealm, UserPreferences } from "~Storage"

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

    /**
     * Sets the selected account in the user preferences entity
     * @param account
     * @param accountNotInitiated Perform the write transaction only if the account is not initiated
     * @param alreadyInWriteTransaction
     */

    return {
        isAppLockActive,
        currentNetwork,
        theme,
        selectedAccount,
        balanceVisible,
        userPreferencesEntity,
    }
}
