import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BackButtonGenericHeader, BaseView, Layout } from "~Components"
import { useThemedStyles, useVisitedUrls } from "~Hooks"
import { Routes } from "~Navigation"
import { URIUtils } from "~Utils"
import { SearchBar } from "./Components/SearchBar"
import { SearchResults } from "./Components/SearchResults"

export const SearchScreen = () => {
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation()
    const { addVisitedUrl } = useVisitedUrls()

    const [search, setSearch] = useState("")

    const onSearchUpdated = useCallback((value: string) => {
        setSearch(value)
    }, [])

    const onSearchReturn = useCallback(
        async (value: string) => {
            const isValid = await URIUtils.isValidBrowserUrl(value.toLowerCase())

            if (isValid) {
                nav.navigate(Routes.BROWSER, { url: value.toLowerCase() })
                addVisitedUrl(value.toLowerCase())
                return
            }
            //TODO: Add error state
        },
        [addVisitedUrl, nav],
    )

    const renderHeader = useMemo(() => {
        return (
            <BackButtonGenericHeader
                rightElement={<SearchBar onTextChange={onSearchUpdated} onReturnClicked={onSearchReturn} />}
                style={styles.headerContainer}
            />
        )
    }, [onSearchUpdated, onSearchReturn, styles.headerContainer])

    return (
        <Layout
            hasSafeArea
            noBackButton
            fixedHeader={renderHeader}
            fixedBody={
                <BaseView style={[styles.rootContainer]}>
                    <SearchResults query={search} />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
        },
        headerContainer: {
            paddingHorizontal: 8,
        },
    })
