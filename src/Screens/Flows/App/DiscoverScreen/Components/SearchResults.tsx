import { default as React, useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from "react-native"
import Animated from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType, typography } from "~Constants"
import { SearchError, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { resetBrowserState, useAppDispatch } from "~Storage/Redux"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { SearchResultItem } from "./SearchResultItem"

type Props = {
    error?: SearchError
    results: HistoryItem[]
    isValidQuery: boolean
}

export const SearchResults = ({ error, results, isValidQuery }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useAppDispatch()

    const onClear = useCallback(() => {
        dispatch(resetBrowserState())
    }, [dispatch])

    const isQueryEmptyButWithResults = useMemo(
        () => !isValidQuery && results.length !== 0,
        [isValidQuery, results.length],
    )

    const isQueryEmptyWithNoResults = useMemo(
        () => !isValidQuery && results.length === 0,
        [isValidQuery, results.length],
    )

    const rootStyles = useMemo(() => {
        if (isQueryEmptyWithNoResults || error === SearchError.ADDRESS_CANNOT_BE_REACHED)
            return [styles.rootContainer, styles.rootContainerEmpty]
        return [styles.rootContainer]
    }, [error, isQueryEmptyWithNoResults, styles.rootContainer, styles.rootContainerEmpty])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<HistoryItem>) => {
            return <SearchResultItem item={item} isValidQuery={isValidQuery} />
        },
        [isValidQuery],
    )

    if (error === SearchError.ADDRESS_CANNOT_BE_REACHED)
        return (
            <Animated.ScrollView contentContainerStyle={rootStyles}>
                <BaseView alignItems="center" justifyContent="center" flexDirection="row" flexGrow={1}>
                    <BaseView style={styles.errorContainer}>
                        <BaseIcon
                            name="icon-disconnect"
                            style={styles.errorIcon}
                            size={32}
                            color={theme.colors.emptyStateIcon.foreground}
                        />
                        <BaseText>{LL.BROWSER_HISTORY_ADDRESS_ERROR()}</BaseText>
                    </BaseView>
                </BaseView>
            </Animated.ScrollView>
        )

    return (
        <Animated.View style={rootStyles}>
            {isQueryEmptyButWithResults && (
                <BaseView justifyContent="space-between" flexDirection="row" alignItems="center" mb={24}>
                    <BaseText typographyFont="bodyMedium">{LL.BROWSER_HISTORY_DEFAULT_TITLE()}</BaseText>
                    <BaseButton
                        action={onClear}
                        rightIcon={
                            <BaseIcon size={12} name="icon-retry" style={styles.clearIcon} color={theme.colors.text} />
                        }
                        variant="ghost"
                        px={0}
                        py={0}>
                        <Text style={styles.clearText}>{LL.BROWSER_HISTORY_CLEAR()}</Text>
                    </BaseButton>
                </BaseView>
            )}

            {isValidQuery && (
                <BaseView justifyContent="flex-start" flexDirection="row" alignItems="flex-start" mb={24}>
                    <BaseText typographyFont="bodyMedium">
                        {LL.BROWSER_HISTORY_RESULTS_AMOUNT({ amount: results.length })}
                    </BaseText>
                </BaseView>
            )}

            {isQueryEmptyWithNoResults ? (
                <BaseView alignItems="center" justifyContent="center" flexGrow={1}>
                    <BaseView style={styles.errorContainer}>
                        <BaseIcon
                            name="icon-history"
                            style={styles.errorIcon}
                            size={32}
                            color={theme.colors.emptyStateIcon.foreground}
                        />
                        <BaseText>{LL.BROWSER_HISTORY_EMPTY()}</BaseText>
                    </BaseView>
                </BaseView>
            ) : (
                <FlatList
                    renderItem={renderItem}
                    keyExtractor={item => (item.type === HistoryUrlKind.DAPP ? item.dapp.href : item.url)}
                    ItemSeparatorComponent={renderItemSeparator}
                    contentContainerStyle={styles.flatListPadding}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    data={results}
                    style={styles.flatListRoot}
                />
            )}
        </Animated.View>
    )
}

const baseStyles = (theme: ColorThemeType) => {
    return StyleSheet.create({
        rootContainer: {
            flexGrow: 1,
            paddingHorizontal: 24,
        },
        rootContainerEmpty: {
            justifyContent: "center",
        },
        clearText: {
            ...typography.defaults.body,
            fontWeight: "500",
            color: theme.colors.text,
        },
        clearIcon: {
            marginLeft: 4,
        },
        errorContainer: {
            gap: 24,
            flexDirection: "column",
        },
        errorIcon: {
            borderRadius: 999,
            padding: 16,
            backgroundColor: theme.colors.emptyStateIcon.background,
            alignSelf: "center",
        },
        flatListPadding: { paddingBottom: 24 },
        flatListRoot: { flex: 1 },
    })
}
