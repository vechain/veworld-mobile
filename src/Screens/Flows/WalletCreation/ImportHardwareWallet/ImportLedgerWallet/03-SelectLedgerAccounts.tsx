import React, { useCallback, useEffect, useState } from "react"
import {
    BaseActivityIndicator,
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    showErrorToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { ColorThemeType, VET } from "~Constants"
import { FormattingUtils, LedgerUtils } from "~Utils"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"

import {
    selectHasOnboarded,
    selectSelectedNetwork,
    setNewLedgerDevice,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FlashList, ViewToken } from "@shopify/flash-list"
import * as Haptics from "expo-haptics"
import { LedgerAccount } from "~Model"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS
>

export const SelectLedgerAccounts: React.FC<Props> = ({ route }) => {
    const { device, rootAccount } = route.params
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles: themedStyles, theme } = useThemedStyles(styles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([])
    const [ledgerAccountsLoading, setLedgerAccountsLoading] = useState(false)
    const [selectedAccountsIndex, setSelectedAccountsIndex] = useState<
        number[]
    >([])
    const [isScrollable, setIsScrollable] = useState(false)

    const navigateNext = useCallback(() => {
        if (userHasOnboarded) {
            nav.navigate(Routes.WALLET_SUCCESS)
        } else {
            nav.navigate(Routes.APP_SECURITY)
        }
    }, [nav, userHasOnboarded])

    const onConfirm = useCallback(async () => {
        try {
            if (selectedAccountsIndex.length > 0 && rootAccount) {
                // set device in the store we can use it in walletSuccess

                dispatch(
                    setNewLedgerDevice({
                        deviceId: device.id,
                        rootAccount,
                        alias: device.localName,
                        accounts: selectedAccountsIndex,
                    }),
                )
                navigateNext()
            }
        } catch (e) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            showErrorToast(e as string)
        }
    }, [selectedAccountsIndex, rootAccount, device, dispatch, navigateNext])

    /**
     * When the root account changes, fetch the accounts and balances
     */
    useEffect(() => {
        const getLedgerAccounts = async () => {
            if (rootAccount) {
                setLedgerAccountsLoading(true)
                const accounts = await LedgerUtils.getAccountsWithBalances(
                    rootAccount,
                    selectedNetwork,
                    10,
                )
                setLedgerAccounts(accounts)
            }
            setLedgerAccountsLoading(false)
        }
        getLedgerAccounts()
    }, [rootAccount, selectedNetwork])

    const goBack = useCallback(() => nav.goBack(), [nav])

    const renderItem = ({
        item,
        index,
    }: {
        item: LedgerAccount
        index: number
    }) => {
        const isSelected = selectedAccountsIndex.some(ind => ind === index)

        const style = isSelected
            ? themedStyles.selected
            : themedStyles.notSelected

        const onAccountClick = () => {
            setSelectedAccountsIndex(prev => {
                const alreadySelected = prev.findIndex(ind => ind === index)
                if (alreadySelected >= 0) {
                    return prev.filter(ind => index !== ind)
                } else {
                    return [...prev, index]
                }
            })
        }

        return (
            <BaseTouchableBox
                key={item.address}
                action={onAccountClick}
                innerContainerStyle={style}
                flexDirection="row"
                justifyContent="space-between">
                <BaseView flexDirection="column" alignItems="flex-start">
                    <BaseText typographyFont="subSubTitle">
                        {LL.WALLET_LABEL_ACCOUNT()} {index + 1}
                    </BaseText>
                    <BaseSpacer height={6} />
                    <BaseText typographyFont="captionRegular">
                        {FormattingUtils.humanAddress(item.address)}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="captionRegular">
                    {item.balance &&
                        FormattingUtils.humanNumber(
                            item.balance?.balance,
                            item.balance?.balance,
                        )}{" "}
                    {VET.symbol}
                </BaseText>
            </BaseTouchableBox>
        )
    }

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    const checkViewableItems = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            setIsScrollable(viewableItems.length < ledgerAccounts.length)
        },
        [ledgerAccounts.length],
    )

    return (
        <BaseSafeArea grow={1}>
            <BaseActivityIndicator
                isVisible={ledgerAccountsLoading}
                onHide={() => null}
            />
            <BaseIcon
                style={themedStyles.backIcon}
                mx={8}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />
            <BaseSpacer height={22} />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start" w={100}>
                    <BaseView flexDirection="row" w={100}>
                        <BaseText typographyFont="title">
                            {LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
                        </BaseText>
                    </BaseView>
                    <BaseText typographyFont="body" my={10}>
                        {LL.WALLET_LEDGER_SELECT_DEVICE_SB()}
                    </BaseText>

                    <BaseSpacer height={20} />
                    <BaseView style={themedStyles.container} pb={20}>
                        {!!ledgerAccounts.length && (
                            <FlashList
                                data={ledgerAccounts}
                                extraData={selectedAccountsIndex}
                                scrollEnabled={isScrollable}
                                onViewableItemsChanged={checkViewableItems}
                                keyExtractor={item => item.address}
                                ItemSeparatorComponent={renderSeparator}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                estimatedItemSize={100}
                                estimatedListSize={{
                                    height: 184,
                                    width:
                                        152 * ledgerAccounts.length +
                                        (ledgerAccounts.length - 1) * 16,
                                }}
                            />
                        )}
                    </BaseView>
                </BaseView>
                <BaseView w={100}>
                    <BaseButton
                        action={onConfirm}
                        w={100}
                        title={LL.COMMON_LBL_IMPORT()}
                        disabled={!selectedAccountsIndex.length}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}

const styles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
        container: {
            width: "100%",
            height: 500,
        },
        selected: {
            borderWidth: 1.5,
            borderColor: theme.colors.text,
        },
        notSelected: {
            borderWidth: 1.5,
            borderColor: theme.colors.card,
        },
    })
