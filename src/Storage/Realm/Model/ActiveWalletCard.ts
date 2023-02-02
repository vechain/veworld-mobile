import { Object } from "realm"

export class ActiveWalletCard extends Object<ActiveWalletCard> {
    _id = "ACTIVE_WALLET_CARD"

    isLoading = false
    activeIndex = 0

    static primaryKey = "_id"
}
