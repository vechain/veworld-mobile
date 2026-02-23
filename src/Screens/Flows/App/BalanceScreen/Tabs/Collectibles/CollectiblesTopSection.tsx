import React from "react"
import { CollectiblesList } from "../../Components/Collectibles/CollectiblesList"
import { BaseView } from "~Components/Base"

export const CollectiblesTopSection = () => {
    return (
        <BaseView px={24}>
            <CollectiblesList />
        </BaseView>
    )
}
