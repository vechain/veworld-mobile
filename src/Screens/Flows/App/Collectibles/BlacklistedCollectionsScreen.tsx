import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useEffect, useRef } from "react"
import { FlatList } from "react-native"
import { Layout } from "~Components"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectBlackListedAddresses, useAppSelector } from "~Storage/Redux"
import { CollectionsList } from "./Components/CollectionsList"

export const BlacklistedCollectionsScreen = () => {
    const { LL } = useI18nContext()
    const scrollRef = useRef<FlatList<string>>(null)
    const blacklistedCollections = useAppSelector(selectBlackListedAddresses)

    const nav = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()
    useEffect(() => {
        if (blacklistedCollections.length === 0) nav.replace(Routes.COLLECTIBLES_COLLECTIONS)
    }, [blacklistedCollections.length, nav])

    return (
        <Layout
            hasSafeArea={false}
            title={LL.HIDDEN_COLLECTIONS()}
            fixedBody={<CollectionsList scrollRef={scrollRef} data={blacklistedCollections} />}
        />
    )
}
