import { useMemo } from "react"
import { Config, useObjectListener, useRealm } from "~Storage"

export const useConfigEntity = () => {
    const { store } = useRealm()

    const configEntity = useObjectListener(
        Config.getName(),
        Config.getPrimaryKey(),
        store,
    ) as Config

    const isWalletCreated = useMemo(
        () => configEntity?.isWalletCreated,
        [configEntity],
    )

    const isResettingApp = useMemo(
        () => configEntity?.isResettingApp,
        [configEntity],
    )

    const userSelectedSecurity = useMemo(
        () => configEntity?.userSelectedSecurity,
        [configEntity?.userSelectedSecurity],
    )

    const isSecurityDowngrade = useMemo(
        () => configEntity?.isSecurityDowngrade,
        [configEntity],
    )

    return {
        configEntity,
        isWalletCreated,
        userSelectedSecurity,
        isSecurityDowngrade,
        isResettingApp,
    }
}
