import { useObjectListener, useRealm } from "~Storage"
import { SelectedAccount } from "~Storage/Realm/Model"

export const useSelectedAccountEntity = () => {
    const { store } = useRealm()

    // let selectedAccount = store.objectForPrimaryKey<SelectedAccount>(
    //     ActiveWalletCard.getName(),
    //     ActiveWalletCard.getPrimaryKey(),
    // )

    const selectedAccount = useObjectListener(
        SelectedAccount.getName(),
        SelectedAccount.getPrimaryKey(),
        store,
    ) as SelectedAccount

    // const onScrollEnd = useCallback(
    //     (index: number) => {
    //         cache.write(() => {
    //             if (card) {
    //                 card.activeIndex = index
    //             }
    //         })
    //     },
    //     [cache, card],
    // )

    return selectedAccount
}
