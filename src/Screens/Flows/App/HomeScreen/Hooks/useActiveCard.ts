import { useCallback } from "react"
import { ActiveWalletCard, RealmClass, useCache } from "~Storage"

export const useActiveCard = () => {
    const cache = useCache()

    const onScrollBegin = useCallback(() => {
        cache.write(() => {
            let card = cache.objectForPrimaryKey<ActiveWalletCard>(
                RealmClass.ActiveWalletCard,
                "ACTIVE_WALLET_CARD",
            )
            if (card) {
                card.isLoading = true
            } else {
                let _card = cache.create<ActiveWalletCard>(
                    RealmClass.ActiveWalletCard,
                    {},
                )
                _card.isLoading = true
            }
        })
    }, [cache])

    const onScrollEnd = useCallback(
        (index: number) => {
            cache.write(() => {
                let card = cache.objectForPrimaryKey<ActiveWalletCard>(
                    RealmClass.ActiveWalletCard,
                    "ACTIVE_WALLET_CARD",
                )
                if (card) {
                    card.isLoading = false
                    card.activeIndex = index
                }
            })
        },
        [cache],
    )

    return { onScrollBegin, onScrollEnd }
}
