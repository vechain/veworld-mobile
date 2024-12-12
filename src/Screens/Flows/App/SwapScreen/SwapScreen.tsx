import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    ChangeAccountButtonPill,
    FavoriteDAppCard,
    Layout,
    ListEmptyResults,
    SelectAccountBottomSheet,
} from "~Components"
import { AnalyticsEvent, DiscoveryDApp } from "~Constants"
import { useAnalyticTracking, useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useFetchFeaturedDApps } from "~Hooks/useFetchFeaturedDApps"
import { useI18nContext } from "~i18n"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    addNavigationToDApp,
    selectBalanceVisible,
    selectBookmarkedDapps,
    selectSelectedAccount,
    selectSwapFeaturedDapps,
    selectVisibleAccounts,
    setSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { ListSkeleton } from "./components"

type NavigationProps = NativeStackNavigationProp<RootStackParamListHome, Routes.SWAP>

export const SwapScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const nav = useNavigation<NavigationProps>()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const accounts = useAppSelector(selectVisibleAccounts)
    const swappDApps = useAppSelector(selectSwapFeaturedDapps)
    const bookmarkedDApps = useAppSelector(selectBookmarkedDapps)

    const { isFetching } = useFetchFeaturedDApps()

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const dAppsToShow = useMemo(() => {
        const swapDAppsBookmarked: DiscoveryDApp[] = []
        const swapDAppsNotBookmarked: DiscoveryDApp[] = []

        swappDApps.forEach(dapp => {
            if (bookmarkedDApps.find(b => b.name === dapp.name)) {
                swapDAppsBookmarked.push(dapp)
            } else {
                swapDAppsNotBookmarked.push(dapp)
            }
        })

        swapDAppsBookmarked.sort((a, b) => a.name.localeCompare(b.name))
        swapDAppsNotBookmarked.sort((a, b) => a.name.localeCompare(b.name))
        return [...swapDAppsBookmarked, ...swapDAppsNotBookmarked]
    }, [bookmarkedDApps, swappDApps])

    const onDAppPress = useCallback(
        ({ href, custom }: { href: string; custom?: boolean }) => {
            nav.navigate(Routes.BROWSER, { url: href })

            track(AnalyticsEvent.SWAPP_USER_OPENED_DAPP, {
                url: href,
            })
            setTimeout(() => {
                dispatch(addNavigationToDApp({ href: href, isCustom: custom ?? false }))
            }, 1000)
        },
        [nav, track, dispatch],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={12} />, [])
    const renderFooter = useCallback(() => <BaseSpacer height={24} />, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DiscoveryDApp>) => {
            return <FavoriteDAppCard dapp={item} onDAppPress={onDAppPress} />
        },
        [onDAppPress],
    )

    return (
        <Layout
            safeAreaTestID="Swap_Screen"
            noMargin
            hasSafeArea={true}
            hasTopSafeAreaOnly={false}
            fixedHeader={
                <BaseView px={20}>
                    <BaseView flexDirection="row" justifyContent="space-between">
                        <BaseText typographyFont="title">{LL.SWAP_TITLE()}</BaseText>

                        <ChangeAccountButtonPill
                            title={selectedAccount.alias ?? LL.WALLET_LABEL_ACCOUNT()}
                            text={selectedAccount.address}
                            action={openSelectAccountBottomSheet}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                </BaseView>
            }
            fixedBody={
                <BaseView flex={1} px={20}>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="body">{LL.SWAP_DESCRIPTION()}</BaseText>
                    <BaseSpacer height={24} />
                    <BaseText typographyFont="body">{LL.SWAP_DAPP_NUMBER({ total: dAppsToShow.length })}</BaseText>
                    <BaseSpacer height={16} />
                    {isFetching ? (
                        <ListSkeleton />
                    ) : (
                        <FlatList
                            contentContainerStyle={styles.listContentContainer}
                            data={dAppsToShow}
                            keyExtractor={(item, index) => item?.href ?? index.toString()}
                            renderItem={renderItem}
                            ListFooterComponent={renderFooter}
                            ItemSeparatorComponent={renderSeparator}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <ListEmptyResults subtitle={LL.SWAP_EMPTY_LIST()} icon={"icon-search"} />
                            }
                        />
                    )}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        isBalanceVisible={isBalanceVisible}
                        ref={selectAccountBottomSheetRef}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = () =>
    StyleSheet.create({
        listContentContainer: {
            flexGrow: 1,
        },
    })
