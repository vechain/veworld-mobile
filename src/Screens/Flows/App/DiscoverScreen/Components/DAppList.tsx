import React, { useCallback, useRef } from "react"
import { CompatibleDApp } from "~Constants"
import { FlatList } from "react-native-gesture-handler"
import { DAppCard } from "~Screens/Flows/App/DiscoverScreen/Components/DAppCard"
import { useScrollToTop } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { BaseSpacer } from "~Components"
import { EmptyResults } from "./EmptyResults"
import { useI18nContext } from "~i18n"
import { DAppTabType } from "~Model"
import { useBrowserSearch } from "~Hooks"
import {
    selectAllDapps,
    selectCustomDapps,
    selectFavoritesDapps,
    selectFeaturedDapps,
    useAppSelector,
} from "~Storage/Redux"

const filterDapps = (dapps: CompatibleDApp[], searchText: string) => {
    return dapps.filter(dapp => {
        return (
            dapp.name.toLowerCase().includes(searchText.toLowerCase()) ||
            dapp.href.toLowerCase().includes(searchText.toLowerCase())
        )
    })
}

type Props = {
    onDAppPress: (dapp: CompatibleDApp) => void
    filteredSearch?: string
    setTab: (tab: DAppTabType) => void
    tab: DAppTabType
    selector:
        | typeof selectFavoritesDapps
        | typeof selectFeaturedDapps
        | typeof selectCustomDapps
        | typeof selectAllDapps
}

export const DAppList: React.FC<Props> = ({ onDAppPress, filteredSearch, setTab, tab, selector }: Props) => {
    const { LL } = useI18nContext()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)

    const { navigateToBrowser } = useBrowserSearch()

    const renderItem = useCallback(
        ({ item }: { item: CompatibleDApp }) => {
            return <DAppCard dapp={item} onPress={onDAppPress} />
        },
        [onDAppPress],
    )

    const dapps: CompatibleDApp[] = useAppSelector(selector)

    const filteredDapps = React.useMemo(() => {
        if (!filteredSearch) return dapps

        return filterDapps(dapps, filteredSearch)
    }, [dapps, filteredSearch])

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    if (filteredSearch && filteredDapps.length === 0) {
        return (
            <>
                {/*TODO remove spacer and put the below in the middle*/}
                <BaseSpacer height={40} />
                <EmptyResults
                    onClick={() => navigateToBrowser(filteredSearch)}
                    title={LL.DISCOVER_SEARCH()}
                    subtitle={LL.DISCOVER_EMPTY_SEARCH()}
                    icon={"search"}
                />
            </>
        )
    }

    if (dapps.length === 0 && tab !== "featured") {
        return (
            <>
                {/*TODO remove spacer and put the below in the middle*/}
                <BaseSpacer height={40} />
                <EmptyResults
                    onClick={() => setTab("featured")}
                    title={LL.DISCOVER_NO_DAPPS_FOUND()}
                    subtitle={LL.DISCOVER_EMPTY_FAVOURITES_SUBTITLE()}
                    icon={"search"}
                />
            </>
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={filteredDapps}
            contentContainerStyle={styles.container}
            ItemSeparatorComponent={renderSeparator}
            scrollEnabled={true}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
    },
})
