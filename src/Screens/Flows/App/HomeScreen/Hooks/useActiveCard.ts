import { useCallback } from "react"
import { ActiveWalletCard, useCache } from "~Storage"

export const useActiveCard = () => {
    const cache = useCache()

    let card = cache.objectForPrimaryKey<ActiveWalletCard>(
        ActiveWalletCard.getName(),
        ActiveWalletCard.PrimaryKey(),
    )

    const onScrollEnd = useCallback(
        (index: number) => {
            cache.write(() => {
                if (card) {
                    card.activeIndex = index
                }
            })
        },
        [cache, card],
    )

    return onScrollEnd
}
