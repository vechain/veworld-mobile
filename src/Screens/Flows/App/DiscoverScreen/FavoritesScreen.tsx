import React from "react"
import { BaseText, BaseView } from "~Components"
// import { selectBookmarkedDapps, useAppSelector } from "~Storage/Redux"

export const FavouritesScreen = ({}: {}) => {
    // const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    return (
        <BaseView>
            <BaseText>{"Favourite Screen"}</BaseText>
        </BaseView>
    )
}
