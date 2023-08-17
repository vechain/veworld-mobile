import React, { useCallback, useMemo, useState } from "react"
import { useBottomSheetModal, useScrollableList, useTheme } from "~Hooks"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    QRCodeBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"
import {
    CustomTokenBox,
    NoTokensButton,
    SkeletonCustomTokenBox,
} from "./Components"
import { PlatformUtils } from "~Utils"
import { tabbarBaseStyles } from "~Navigation"
import { SkeletonActivityBox } from "../HistoryScreen/Components"
import { AddCustomTokenBottomSheet } from "./BottomSheets"
import { useTokensOwned } from "./Hooks"

// Number of Skeleton Token boxes to show when fetching first page of custom tokens owned.
const SKELETON_COUNT = 12

export const ManageCustomTokenScreen = () => {
    // Pull down to refresh
    const [refreshing, setRefreshing] = useState(false)

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    // Address of the custom token the user wants to add to the home screen.
    const [customTokenAddress, setCustomTokenAddress] = useState<string>()

    const theme = useTheme()

    const { LL } = useI18nContext()

    const { tokens, hasFetched, page, setPage, fetchTokens } = useTokensOwned()

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(tokens, 1, 2) // 1 and 2 are to simulate snapIndex fully expanded.

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } =
        useBottomSheetModal()

    const onAddCustomToken = useCallback(
        (tokenAddress: string) => {
            setCustomTokenAddress(tokenAddress)

            openAddCustomTokenSheet()
        },
        [openAddCustomTokenSheet],
    )

    const onScroll = useCallback(() => {
        setHasScrolled(true)
    }, [])

    const onEndReached = useCallback(async () => {
        if (hasScrolled) {
            await fetchTokens()
        }
    }, [fetchTokens, hasScrolled])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        setHasScrolled(false)
        setPage(0)

        setRefreshing(false)
    }, [setPage])

    const tokensListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const renderCustomTokensList = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" style={[styles.list]}>
                    <FlashList
                        data={tokens}
                        keyExtractor={token => token.tokenAddress}
                        ItemSeparatorComponent={tokensListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        scrollEnabled={isListScrollable}
                        ListHeaderComponent={<BaseSpacer height={8} />}
                        ListFooterComponent={
                            hasFetched ? (
                                <BaseSpacer height={20} />
                            ) : (
                                <BaseView mr={20} ml={36} pt={12}>
                                    <SkeletonActivityBox />
                                </BaseView>
                            )
                        }
                        renderItem={({ item: token }) => {
                            const tokenId = `${token.tokenAddress}`

                            return (
                                <BaseView mx={20} testID={tokenId}>
                                    <CustomTokenBox
                                        tokenBalance={token}
                                        onTogglePress={onAddCustomToken}
                                    />
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={80}
                        estimatedListSize={{
                            height: 80 * tokens.length,
                            width: 400,
                        }}
                        onScroll={onScroll}
                        onEndReachedThreshold={0.5}
                        onEndReached={onEndReached}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.border}
                            />
                        }
                        testID="contacts-list"
                    />
                </BaseView>
            </>
        )
    }, [
        hasFetched,
        isListScrollable,
        onAddCustomToken,
        onEndReached,
        onRefresh,
        onScroll,
        onViewableItemsChanged,
        refreshing,
        theme.colors.border,
        tokens,
        tokensListSeparator,
        viewabilityConfig,
    ])

    const renderSkeletonList = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" style={styles.list}>
                    <FlatList
                        data={[...Array(SKELETON_COUNT)]}
                        keyExtractor={(_, index) => `skeleton-${index}`}
                        ListFooterComponent={<BaseSpacer height={20} />}
                        renderItem={() => {
                            return (
                                <BaseView mx={20}>
                                    <SkeletonCustomTokenBox />
                                </BaseView>
                            )
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                </BaseView>
            </>
        )
    }, [])

    const renderNoTokensButton = useMemo(() => {
        return (
            <BaseView
                justifyContent="center"
                alignItems="center"
                w={100}
                style={styles.noTokensButton}>
                <NoTokensButton onPress={openQRCodeSheet} />
            </BaseView>
        )
    }, [openQRCodeSheet])

    return (
        <Layout
            safeAreaTestID="History_Screen"
            fixedHeader={
                <>
                    <BaseText typographyFont="subTitleBold" pb={8}>
                        {LL.MANAGE_TOKEN_TITLE_YOUR_TOKENS()}
                    </BaseText>
                    <BaseText typographyFont="bodyMedium" pb={8}>
                        {LL.MANAGE_TOKEN_ADD_CUSTOM_TOKNE_SUBTITLE()}
                    </BaseText>
                </>
            }
            fixedBody={
                <>
                    {/* Tokens List */}
                    {!!tokens.length &&
                        (page !== 0 || hasFetched) &&
                        renderCustomTokensList}

                    {/* Fetching Tokens shows skeleton */}
                    {!hasFetched && page === 0 && renderSkeletonList}

                    {/* No Tokens owned */}
                    {!tokens.length && hasFetched && renderNoTokensButton}

                    <AddCustomTokenBottomSheet
                        ref={addCustomTokenSheetRef}
                        onClose={closeAddCustomTokenSheet}
                        tokenAddress={customTokenAddress}
                    />

                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                </>
            }
        />
    )
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 20,
        marginVertical: 8,
    },
    underlayContainer: {
        flexDirection: "row",
    },
    list: {
        top: 0,
        flex: 1,
        marginBottom: PlatformUtils?.isIOS()
            ? 0
            : tabbarBaseStyles?.tabbar?.height,
    },
    noTokensButton: {
        position: "absolute",
        bottom: "50%",
    },
})
