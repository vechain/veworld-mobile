import React, { useCallback, useRef } from "react"
import { DiscoveryDApp } from "~Constants"
import { FlatList } from "react-native-gesture-handler"
import { DAppCard } from "~Screens/Flows/App/DiscoverScreen/Components/DAppCard"
import { useNavigation, useRoute, useScrollToTop } from "@react-navigation/native"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { EmptyResults } from "./EmptyResults"
import { useI18nContext } from "~i18n"
import { useBrowserSearch, useTheme } from "~Hooks"
import { useAppSelector } from "~Storage/Redux"
import { Routes } from "~Navigation"

const filterDapps = (dapps: DiscoveryDApp[], searchText: string) => {
    return dapps.filter(dapp => {
        return (
            dapp.name.toLowerCase().includes(searchText.toLowerCase()) ||
            dapp.href.toLowerCase().includes(searchText.toLowerCase())
        )
    })
}

type Props = {
    onDAppPress: (dapp: DiscoveryDApp) => void
    filteredSearch?: string
    selector: (...state: any) => DiscoveryDApp[]
    setFilteredSearch: (search: string | undefined) => void
}

export const DAppList: React.FC<Props> = ({ onDAppPress, filteredSearch, selector, setFilteredSearch }: Props) => {
    const { LL } = useI18nContext()
    const flatListRef = useRef(null)
    useScrollToTop(flatListRef)
    const navigation = useNavigation()
    const tab = useRoute().name
    const setTab = (newTab: Routes.DISCOVER_FEATURED | Routes.DISCOVER_FAVOURITES) => {
        navigation.navigate(newTab)
    }
    const { navigateToBrowser } = useBrowserSearch()
    const theme = useTheme()

    const renderItem = useCallback(
        ({ item }: { item: DiscoveryDApp }) => {
            return <DAppCard dapp={item} onPress={onDAppPress} />
        },
        [onDAppPress],
    )

    const dapps: DiscoveryDApp[] = useAppSelector(selector)

    const filteredDapps = React.useMemo(() => {
        if (!filteredSearch) {
            return dapps
        }

        return filterDapps(dapps, filteredSearch)
    }, [dapps, filteredSearch])

    const navigateToSearch = useCallback(() => {
        if (!filteredSearch) return

        navigateToBrowser(filteredSearch)
        setFilteredSearch(undefined)
    }, [filteredSearch, navigateToBrowser, setFilteredSearch])

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    if (filteredSearch && filteredDapps.length === 0) {
        return (
            <EmptyResults
                onClick={navigateToSearch}
                title={LL.DISCOVER_SEARCH_CTA()}
                subtitle={LL.DISCOVER_EMPTY_SEARCH()}
                icon={"search-web"}
            />
        )
    }

    if (dapps.length === 0 && tab === Routes.DISCOVER_FAVOURITES) {
        return (
            <BaseView justifyContent="center" alignItems="center" flex={1}>
                <BaseIcon name={"heart"} size={30} color={theme.colors.text} />
                <BaseSpacer height={8} />
                <BaseText mx={24} typographyFont="body" align="center">
                    {LL.DISCOVER_EMPTY_FAVOURITES_SUBTITLE()}
                </BaseText>
                <BaseSpacer height={40} />
                <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                    <BaseButton
                        action={() => setTab(Routes.DISCOVER_FEATURED)}
                        title={LL.DISCOVER_EMPTY_FAVOURITES()}
                        haptics="Light"
                    />
                </BaseView>
                <BaseText mx={24} my={16} typographyFont="body" align="center">
                    {LL.COMMON_OR()}
                </BaseText>
                <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                    <BaseButton
                        action={() => navigateToBrowser("")}
                        title={LL.DISCOVER_EMPTY_CUSTOM_NODES()}
                        haptics="Light"
                    />
                </BaseView>
            </BaseView>
        )
    }

    return (
        <FlatList
            ref={flatListRef}
            data={filteredDapps}
            contentContainerStyle={styles.container}
            ItemSeparatorComponent={renderSeparator}
            scrollEnabled={true}
            keyExtractor={item => item.href}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={renderItem}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
})
