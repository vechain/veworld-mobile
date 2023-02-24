import { useCallback } from "react"
import { ActiveWalletCard, useRealm } from "~Storage"

export const useActiveCard = () => {
    const { cache } = useRealm()

    let card = cache.objectForPrimaryKey<ActiveWalletCard>(
        ActiveWalletCard.getName(),
        ActiveWalletCard.getPrimaryKey(),
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
