import { useCallback } from "react"
import { ActiveWalletCard, useCache } from "~Storage"

export const useActiveCard = () => {
    const cache = useCache()

    const onScrollBegin = useCallback(() => {
        let card = cache.objects<ActiveWalletCard>(ActiveWalletCard.getName())

        cache.write(() => {
            if (card[0]) {
                card[0].isLoading = true
            } else {
                console.log(
                    "REALM CLASS:: ACTIVE WALLET CARD :: NOT INITIALIZED",
                )
            }
        })
    }, [cache])

    const onScrollEnd = useCallback(
        (index: number) => {
            let card = cache.objects<ActiveWalletCard>(
                ActiveWalletCard.getName(),
            )

            cache.write(() => {
                if (card[0]) {
                    card[0].isLoading = false
                    card[0].activeIndex = index
                } else {
                    console.log(
                        "REALM CLASS:: ACTIVE WALLET CARD :: NOT INITIALIZED",
                    )
                }
            })
        },
        [cache],
    )

    return { onScrollBegin, onScrollEnd }
}
