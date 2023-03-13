import { useMemo } from "react"
import { ActiveWalletCard, useObjectListener, useRealm } from "~Storage"

export const useActiveWalletEntity = () => {
    const { cache } = useRealm()

    const activeWalletEntity = useObjectListener(
        ActiveWalletCard.getName(),
        ActiveWalletCard.getPrimaryKey(),
        cache,
    ) as ActiveWalletCard

    const activeCardIndex = useMemo(
        () => activeWalletEntity.activeIndex,
        [activeWalletEntity.activeIndex],
    )

    return { activeCardIndex }
}
