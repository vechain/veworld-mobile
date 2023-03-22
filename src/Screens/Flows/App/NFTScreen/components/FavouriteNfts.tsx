import React from "react"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { NFTItem } from "../NFTScreen"
import { NftsList } from "./NftsList"

const NUM_ITEMS = 20
function getColor(i: number) {
    const multiplier = 255 / (NUM_ITEMS - 1)
    const colorVal = i * multiplier
    return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`
}

const initialData: NFTItem[] = [...Array(NUM_ITEMS)].map((d, index) => {
    const backgroundColor = getColor(index)
    return {
        key: `item-${index}`,
        label: String(index) + "",
        height: 100,
        width: 60 + Math.random() * 40,
        backgroundColor,
    }
})

export const FavouriteNfts = () => {
    const { LL } = useI18nContext()

    return (
        <BaseView mx={20}>
            <BaseText typographyFont="subTitle">
                {LL.COMMON_LBL_FAVOURITES()}
            </BaseText>
            <BaseSpacer height={24} />
            <NftsList nfts={initialData} />
        </BaseView>
    )
}
