import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { BackButtonGenericHeader, BaseView, Layout } from "~Components"
import { SearchError, useBrowserSearch, useThemedStyles } from "~Hooks"
import { SearchBar } from "./Components/SearchBar"
import { SearchResults } from "./Components/SearchResults"

export const SearchScreen = () => {
    const { styles } = useThemedStyles(baseStyles)

    const [search, setSearch] = useState("")
    const [error, setError] = useState<SearchError>()
    const { navigateToBrowser, results } = useBrowserSearch(search)

    const onSearchUpdated = useCallback(
        (value: string) => {
            if (typeof error !== "undefined") setError(undefined)
            setSearch(value)
        },
        [error],
    )

    const onSearchReturn = useCallback(
        async (value: string) => {
            const result = await navigateToBrowser(value)
            if (typeof result !== "undefined") setError(result)
        },
        [navigateToBrowser],
    )

    const renderHeader = useMemo(() => {
        return (
            <BackButtonGenericHeader
                rightElement={
                    <SearchBar filteredSearch={search} onTextChange={onSearchUpdated} onSubmit={onSearchReturn} />
                }
                style={styles.headerContainer}
            />
        )
    }, [onSearchUpdated, onSearchReturn, search, styles.headerContainer])

    return (
        <Layout
            hasSafeArea
            noBackButton
            fixedHeader={renderHeader}
            fixedBody={
                <BaseView style={[styles.rootContainer]}>
                    <SearchResults query={search} error={error} results={results} />
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
