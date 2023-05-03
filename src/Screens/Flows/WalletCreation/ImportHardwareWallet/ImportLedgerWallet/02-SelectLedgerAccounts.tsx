import React, { useCallback, useEffect } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    showWarningToast,
} from "~Components"
import { useI18nContext } from "~i18n"
import { debug, useTheme } from "~Common"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"

import useLedger, { LedgerStatus } from "~Common/Hooks/useLedger"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS
>

export const SelectLedgerAccounts: React.FC<Props> = ({ route }) => {
    const { device } = route.params
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const onDisconnect = useCallback(() => {
        showWarningToast("Device disconnected")
    }, [])

    const { status, rootAccount, connect } = useLedger(device, onDisconnect)

    const goBack = () => nav.goBack()

    useEffect(() => {
        debug({ status, rootAccount })
    }, [status, rootAccount])

    // const renderItem = useCallback(
    //     ({ item }: { item: LedgerDevice }) => {
    //         return (
    //             <LedgerDeviceBox
    //                 key={item.id}
    //                 device={item}
    //                 onPress={() => onDeviceSelect(item)}
    //                 isSelected={selectedDevice?.id === item.id}
    //             />
    //         )
    //     },
    //     [onDeviceSelect, selectedDevice],
    // )

    // const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

    return (
        <DismissKeyboardView>
            <BaseSafeArea grow={1}>
                <BaseIcon
                    style={styles.backIcon}
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
                        {/* <FlatList
                            style={styles.container}
                            data={availableDevices}
                            numColumns={1}
                            horizontal={false}
                            renderItem={renderItem}
                            nestedScrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={renderSeparator}
                            keyExtractor={item => item.id}
                        /> */}
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

const styles = StyleSheet.create({
    backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
    container: {
        width: "100%",
    },
})
