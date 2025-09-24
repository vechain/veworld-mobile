import { default as React, useCallback, useMemo, useRef } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { SearchError, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { resetBrowserState, useAppDispatch } from "~Storage/Redux"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { SearchResultItem } from "./SearchResultItem"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"

type Props = {
    error?: SearchError
    results: HistoryItem[]
    isExactMatch: boolean
    isValidQuery: boolean
}

export const SearchResults = ({ error, results, isValidQuery, isExactMatch }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useAppDispatch()

    const swipeableItemRefs = useRef<Map<string, SwipeableItemImperativeRef>>(new Map())

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

    const isQueryWithNoResults = useMemo(() => isValidQuery && results.length === 0, [isValidQuery, results.length])

    const rootStyles = useMemo(() => {
        if (isQueryEmptyWithNoResults || error === SearchError.ADDRESS_CANNOT_BE_REACHED)
            return [styles.rootContainer, styles.rootContainerEmpty]
        return [styles.rootContainer]
    }, [error, isQueryEmptyWithNoResults, styles.rootContainer, styles.rootContainerEmpty])

    const renderItemSeparator = useCallback(() => {
        return <BaseSpacer height={24} />
    }, [])

    const renderItem = useCallback(({ item }: ListRenderItemInfo<HistoryItem>) => {
        return <SearchResultItem item={item} swipeableItemRefs={swipeableItemRefs} />
    }, [])

    if (error === SearchError.ADDRESS_CANNOT_BE_REACHED)
        return (
            <Animated.ScrollView contentContainerStyle={rootStyles}>
                <BaseView alignItems="center" justifyContent="center" flexDirection="row" flexGrow={1}>
                    <BaseView style={styles.errorContainer}>
                        <BaseIcon
                            name="icon-disconnect"
                            style={styles.errorIcon}
                            size={32}
                            color={theme.colors.history.emptyStateIcon.color}
                        />
                        <BaseText testID="search-results-address-error" color={theme.colors.history.emptyStateColor}>
                            {LL.BROWSER_HISTORY_ADDRESS_ERROR()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </Animated.ScrollView>
        )

    if (isQueryWithNoResults)
        return (
            <Animated.View style={rootStyles}>
                <BaseView alignItems="center" justifyContent="center" flexGrow={1}>
                    <BaseView style={styles.errorContainer}>
                        <BaseIcon
                            name="icon-search"
                            style={styles.errorIcon}
                            size={32}
                            color={theme.colors.history.emptyStateIcon.color}
                        />
                        <BaseText testID="search-no-results-title" color={theme.colors.history.emptyStateColor}>
                            {LL.BROWSER_HISTORY_NO_RESULTS()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </Animated.View>
        )

    return (
        <Animated.View style={rootStyles}>
            {isQueryEmptyButWithResults && (
                <BaseView justifyContent="space-between" flexDirection="row" alignItems="center" mb={24}>
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <BaseIcon name="icon-history" size={20} color={theme.colors.history.titleColor} />
                        <BaseText
                            testID="search-results-default-title"
                            typographyFont="subSubTitleSemiBold"
                            color={theme.colors.history.titleColor}>
                            {LL.BROWSER_HISTORY_DEFAULT_TITLE()}
                        </BaseText>
                    </BaseView>
                    <BaseButton
                        testID="search-results-clear-button"
                        action={onClear}
                        rightIcon={
                            <BaseIcon
                                size={16}
                                name="icon-retry"
                                style={styles.clearIcon}
                                color={theme.colors.history.button.text}
                            />
                        }
                        size="sm"
                        style={styles.clearButton}
                        textColor={theme.colors.history.button.text}
                        typographyFont="bodySemiBold"
                        px={12}
                        py={4}>
                        {LL.BROWSER_HISTORY_CLEAR()}
                    </BaseButton>
                </BaseView>
            )}

            {isValidQuery && (
                <BaseView justifyContent="flex-start" flexDirection="row" alignItems="flex-start" mb={12}>
                    <BaseText
                        testID={`search-results${isExactMatch ? "-found" : ""}-title`}
                        typographyFont="bodySemiBold"
                        color={theme.colors.history.titleColor}>
                        {isExactMatch ? LL.BROWSER_HISTORY_FOUND() : LL.BROWSER_HISTORY_RESULTS()}
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
                            color={theme.colors.history.emptyStateIcon.color}
                        />
                        <BaseText testID="search-results-empty-title" color={theme.colors.history.emptyStateColor}>
                            {LL.BROWSER_HISTORY_EMPTY()}
                        </BaseText>
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
            backgroundColor: theme.colors.history.emptyStateIcon.background,
            alignSelf: "center",
        },
        flatListPadding: { paddingBottom: 24 },
        flatListRoot: { flex: 1 },
        clearButton: {
            backgroundColor: theme.colors.history.button.background,
            borderColor: theme.colors.history.button.border,
            borderWidth: 1,
            height: 32,
        },
    })
}
