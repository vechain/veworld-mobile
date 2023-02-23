import { useCallback, useEffect } from "react"
import { WALLET_STATUS } from "~Model"
import { ActiveWalletCard, AppLock, Config, Mnemonic, useRealm } from "~Storage"

export const useInitRealmClasses = () => {
    const { store, cache } = useRealm()

    const init = useCallback(() => {
        cache.write(() => {
            cache.create(AppLock.getName(), { status: WALLET_STATUS.LOCKED })
            cache.create(ActiveWalletCard.getName(), {})
            cache.create(Mnemonic.getName(), {})
        })

        let config = store.objectForPrimaryKey<Config>(
            Config.getName(),
            Config.PrimaryKey(),
        )

        if (!config) {
            store.write(() => {
                store.create(Config.getName(), {})
            })
        }
    }, [cache, store])

    useEffect(() => {
        init()
    }, [init])
}
