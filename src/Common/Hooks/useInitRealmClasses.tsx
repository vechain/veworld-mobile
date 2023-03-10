import { useCallback, useEffect } from "react"
import { WALLET_STATUS } from "~Model"
import { SelectedAccount, AppLock, Config, Mnemonic, useRealm } from "~Storage"

export const useInitRealmClasses = () => {
    const { store, cache } = useRealm()

    const init = useCallback(() => {
        cache.write(() => {
            cache.create(AppLock.getName(), { status: WALLET_STATUS.LOCKED })
            cache.create(Mnemonic.getName(), {})
        })

        const config = store.objectForPrimaryKey<Config>(
            Config.getName(),
            Config.getPrimaryKey(),
        )

        const selectedAccount = store.objectForPrimaryKey<SelectedAccount>(
            SelectedAccount.getName(),
            SelectedAccount.getPrimaryKey(),
        )

        if (!config) {
            store.write(() => {
                store.create(Config.getName(), {})
            })
        }
        if (!selectedAccount) {
            store.write(() => {
                store.create(SelectedAccount.getName(), {})
            })
        }
    }, [cache, store])

    useEffect(() => {
        init()
    }, [init])
}
