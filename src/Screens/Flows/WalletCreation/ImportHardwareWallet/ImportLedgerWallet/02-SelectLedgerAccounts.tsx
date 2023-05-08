import React, { useCallback, useEffect, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    DismissKeyboardView,
    showWarningToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { ColorThemeType, debug, useThemedStyles } from "~Common"
import { VET } from "~Common/Constant/Token"
import { FormattingUtils, LedgerUtils, AddressUtils } from "~Common/Utils"

import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"

import useLedger, { LedgerStatus } from "~Common/Hooks/useLedger"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { LedgerAccount } from "~Common/Utils/LedgerUtils/LedgerUtils"
import { humanAddress } from "~Common/Utils/FormattingUtils/FormattingUtils"
import { FlatList } from "react-native-gesture-handler"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS
>

export const SelectLedgerAccounts: React.FC<Props> = ({ route }) => {
    const { device } = route.params
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { styles: themedStyles, theme } = useThemedStyles(styles)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

    const onDisconnect = useCallback(() => {
        showWarningToast("Device disconnected")
    }, [])

    const { status, rootAccount, connect } = useLedger(device, onDisconnect)
    const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([])
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

    /**
     * When the root account changes, fetch the accounts and balances
     */
    useEffect(() => {
        const getLedgerAccounts = async () => {
            if (rootAccount) {
                const accounts = await LedgerUtils.getAccountsWithBalances(
                    rootAccount,
                    selectedNetwork,
                    10,
                )
                setLedgerAccounts(accounts)
            }
        }
        getLedgerAccounts()
    }, [rootAccount, selectedNetwork])

    const goBack = useCallback(() => nav.goBack(), [nav])

    useEffect(() => {
        debug({ status, rootAccount })
    }, [status, rootAccount])

    const renderItem = useCallback(
        ({ item, index }: { item: LedgerAccount; index: number }) => {
            const isSelected = selectedAccounts.some(address =>
                AddressUtils.compareAddresses(address, item.address),
            )

            const style = isSelected
                ? themedStyles.selected
                : themedStyles.notSelected

            const onAccountClick = () => {
                setSelectedAccounts(prev => {
                    const alreadySelected = prev.findIndex(address =>
                        AddressUtils.compareAddresses(address, item.address),
                    )
                    if (alreadySelected >= 0) {
                        return prev.filter(
                            address =>
                                !AddressUtils.compareAddresses(
                                    address,
                                    item.address,
                                ),
                        )
                    } else {
                        return [...prev, item.address]
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
                            {humanAddress(item.address)}
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
        },
        [themedStyles, selectedAccounts, LL],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
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
                        <BaseView flexDirection="row" w={100}>
                            <BaseText typographyFont="body" my={10}>
                                {status}
                            </BaseText>
                            {status !== LedgerStatus.READY && (
                                <BaseButton title="Refresh" action={connect} />
                            )}
                        </BaseView>
                        <FlatList
                            style={themedStyles.container}
                            data={ledgerAccounts}
                            numColumns={1}
                            horizontal={false}
                            renderItem={renderItem}
                            nestedScrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={renderSeparator}
                            keyExtractor={item => item.address}
                        />
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            action={() => null}
                            w={100}
                            title={LL.COMMON_LBL_IMPORT()}
                            disabled={true}
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}

const styles = (theme: ColorThemeType) =>
    StyleSheet.create({
        backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
        container: {
            width: "100%",
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
