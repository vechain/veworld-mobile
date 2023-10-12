import React, { useCallback, useMemo, useRef, useState } from "react"
import { EditTokensBar, Header, TokenList, AccountCard } from "./Components"
import {
    useBottomSheetModal,
    useCheckVersion,
    useMemoizedAnimation,
    useSetSelectedAccount,
    useTheme,
} from "~Hooks"
import {
    BaseIcon,
    BaseSpacer,
    BaseView,
    FastActionsBar,
    Layout,
    QRCodeBottomSheet,
    SelectAccountBottomSheet,
} from "~Components"
import { FadeInRight } from "react-native-reanimated"
import { useTokenBalances } from "./Hooks"
import {
    selectBalanceVisible,
    selectCurrency,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { AccountWithDevice, FastAction } from "~Model"
import { useI18nContext } from "~i18n"
import { RefreshControl } from "react-native"
import { useNavigation, useScrollToTop } from "@react-navigation/native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { Routes } from "~Navigation"

export const HomeScreen = () => {
    const { updateBalances, updateSuggested } = useTokenBalances()

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const { LL } = useI18nContext()
    // Pull down to refresh
    const [refreshing, setRefreshing] = React.useState(false)

    const theme = useTheme()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } =
        useBottomSheetModal()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await updateBalances()
        await updateSuggested()

        setRefreshing(false)
    }, [updateBalances, updateSuggested])

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const scrollViewRef = useRef(null)

    useScrollToTop(scrollViewRef)

    useCheckVersion()

    const nav = useNavigation()

    const Actions: FastAction[] = useMemo(
        () => [
            {
                name: LL.BTN_BUY(),
                action: () => nav.navigate(Routes.BUY_FLOW),
                icon: (
                    <BaseIcon
                        color={theme.colors.text}
                        name="cart-outline"
                        size={21}
                    />
                ),
                testID: "buyButton",
            },
            {
                name: LL.BTN_SEND(),
                action: () =>
                    nav.navigate(Routes.SELECT_TOKEN_SEND, {
                        initialRoute: Routes.HOME,
                    }),
                icon: (
                    <BaseIcon color={theme.colors.text} name="send-outline" />
                ),
                testID: "sendButton",
            },
            {
                name: LL.BTN_HISTORY(),
                action: () => nav.navigate(Routes.HISTORY),
                icon: <BaseIcon color={theme.colors.text} name="history" />,
                testID: "historyButton",
            },
        ],
        [LL, nav, theme.colors.text],
    )
    const selectedCurrency = useAppSelector(selectCurrency)

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            noMargin
            fixedBody={
                <>
                    <NestableScrollContainer
                        ref={scrollViewRef}
                        testID="HomeScreen_ScrollView"
                        refreshControl={
                            <RefreshControl
                                onRefresh={onRefresh}
                                tintColor={theme.colors.border}
                                refreshing={refreshing}
                            />
                        }>
                        <BaseView>
                            <BaseView alignItems="center">
                                <BaseSpacer height={20} />
                                <AccountCard
                                    balanceVisible={isBalanceVisible}
                                    openSelectAccountBottomSheet={
                                        openSelectAccountBottomSheet
                                    }
                                    account={selectedAccount}
                                    selectedCurrency={selectedCurrency}
                                    openQRCodeSheet={openQRCodeSheet}
                                />
                            </BaseView>
                            <BaseSpacer height={24} />

                            <FastActionsBar actions={Actions} />

                            <BaseSpacer height={24} />
                            <EditTokensBar
                                isEdit={isEdit}
                                setIsEdit={setIsEdit}
                            />
                            <BaseSpacer height={24} />

                            <TokenList
                                isEdit={isEdit}
                                isBalanceVisible={isBalanceVisible}
                                entering={animateEntering}
                            />
                            <BaseSpacer height={24} />
                        </BaseView>

                        {/*Account Selection*/}
                        <SelectAccountBottomSheet
                            closeBottomSheet={closeSelectAccountBottonSheet}
                            accounts={accounts}
                            setSelectedAccount={setSelectedAccount}
                            selectedAccount={selectedAccount}
                            isBalanceVisible={isBalanceVisible}
                            ref={selectAccountBottomSheetRef}
                        />

                        <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                    </NestableScrollContainer>
                </>
            }
        />
    )
}
