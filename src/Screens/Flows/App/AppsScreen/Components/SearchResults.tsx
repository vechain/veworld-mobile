import { default as React, useCallback, useMemo } from "react"
import { ListRenderItemInfo, SectionList, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { SearchError, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { resetBrowserState, useAppDispatch } from "~Storage/Redux"
import { HistoryItem, HistoryUrlKind } from "~Utils/HistoryUtils"
import { SearchResultItem } from "./SearchResultItem"

type Props = {
    error?: SearchError
    results: { found: HistoryItem[]; others: HistoryItem[] }
    isValidQuery: boolean
}
//TODO: section list for more results

export const SearchResults = ({ error, results, isValidQuery }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useAppDispatch()

    const onClear = useCallback(() => {
        dispatch(resetBrowserState())
    }, [dispatch])

    const isQueryEmptyButWithResults = useMemo(
        () => !isValidQuery && results.found.length !== 0,
        [isValidQuery, results.found.length],
    )

    const isQueryEmptyWithNoResults = useMemo(
        () => !isValidQuery && results.found.length === 0,
        [isValidQuery, results.found.length],
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

    const renderSectionHeader = useCallback(
        ({ section }: { section: { key: string } }) => {
            if (!isValidQuery) return <></>
            if (section.key === "found") {
                return (
                    <BaseView justifyContent="flex-start" flexDirection="row" alignItems="flex-start" mb={8}>
                        <BaseText typographyFont="bodySemiBold" color={theme.colors.history.titleColor}>
                            {LL.BROWSER_HISTORY_FOUND()}
                        </BaseText>
                    </BaseView>
                )
            } else if (section.key === "others" && results.others.length > 0) {
                return (
                    <BaseView justifyContent="flex-start" flexDirection="row" alignItems="flex-start" mb={8} mt={24}>
                        <BaseText typographyFont="bodyMedium" color={theme.colors.history.historyItem.subtitle}>
                            {LL.BROWSER_HISTORY_MORE_RESULTS()}
                        </BaseText>
                    </BaseView>
                )
            }

            return <></>
        },
        [
            LL,
            isValidQuery,
            results.others.length,
            theme.colors.history.historyItem.subtitle,
            theme.colors.history.titleColor,
        ],
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
                    <BaseView flexDirection="row" alignItems="center" gap={8}>
                        <BaseIcon name="icon-history" size={16} color={theme.colors.history.titleColor} />
                        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.history.titleColor}>
                            {LL.BROWSER_HISTORY_DEFAULT_TITLE()}
                        </BaseText>
                    </BaseView>
                    <BaseButton
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

            {isQueryEmptyWithNoResults ? (
                <BaseView alignItems="center" justifyContent="center" flexGrow={1}>
                    <BaseView style={styles.errorContainer}>
                        <BaseIcon
                            name="icon-history"
                            style={styles.errorIcon}
                            size={32}
                            color={theme.colors.history.historyItem.iconColor}
                        />
                        <BaseText color={theme.colors.history.historyItem.title}>{LL.BROWSER_HISTORY_EMPTY()}</BaseText>
                    </BaseView>
                </BaseView>
            ) : (
                <SectionList
                    renderItem={renderItem}
                    keyExtractor={item => (item.type === HistoryUrlKind.DAPP ? item.dapp.href : item.url)}
                    ItemSeparatorComponent={renderItemSeparator}
                    contentContainerStyle={styles.flatListPadding}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    renderSectionHeader={renderSectionHeader}
                    stickySectionHeadersEnabled={false}
                    sections={[
                        { data: results.found, key: "found" },
                        { data: results.others, key: "others" },
                    ]}
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
            backgroundColor: theme.colors.history.historyItem.iconBackground,
            alignSelf: "center",
        },
        flatListPadding: { paddingBottom: 24 },
        flatListRoot: { flex: 1 },
        clearButton: {
            backgroundColor: theme.colors.history.button.background,
            borderColor: theme.colors.history.button.border,
            borderWidth: 1,
        },
    })
}
