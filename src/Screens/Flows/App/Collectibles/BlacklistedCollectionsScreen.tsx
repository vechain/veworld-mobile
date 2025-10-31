import React, { useRef } from "react"
import { FlatList } from "react-native"
import { Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { selectBlackListedAddresses, useAppSelector } from "~Storage/Redux"
import { CollectionsList } from "./Components/CollectionsList"

export const BlacklistedCollectionsScreen = () => {
    const { LL } = useI18nContext()
    const scrollRef = useRef<FlatList<string>>(null)
    const blacklistedCollections = useAppSelector(selectBlackListedAddresses)

    return (
        <Layout
            title={LL.HIDDEN_COLLECTIONS()}
            fixedBody={<CollectionsList scrollRef={scrollRef} data={blacklistedCollections} />}
        />
    )
}
