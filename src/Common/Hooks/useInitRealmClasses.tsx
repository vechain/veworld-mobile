import { useEffect } from "react"
import { WALLET_STATUS } from "~Model"
import {
    ActiveWalletCard,
    AppLock,
    Config,
    Mnemonic,
    useCache,
    useStore,
} from "~Storage"

export const useInitRealmClasses = () => {
    const store = useStore()
    const cache = useCache()

    const init = () => {
        cache.write(() => {
            cache.create(AppLock.getName(), { status: WALLET_STATUS.LOCKED })
        })

        cache.write(() => {
            cache.create(ActiveWalletCard.getName(), {})
        })

        cache.write(() => {
            cache.create(Mnemonic.getName(), {})
        })

        let config = store.objects<Config>(Config.getName())

        if (!config[0]) {
            store.write(() => {
                store.create(Config.getName(), {})
            })
        }
    }

    useEffect(() => {
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}
