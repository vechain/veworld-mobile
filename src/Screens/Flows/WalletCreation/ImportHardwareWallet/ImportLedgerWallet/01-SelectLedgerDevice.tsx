import React, { useCallback, useEffect, useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { debug, useTheme } from "~Common"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerDeviceBox } from "../components"
import { FlatList } from "react-native-gesture-handler"
import { Routes } from "~Navigation"
import { ConnectedLedgerDevice } from "~Model"

export const SelectLedgerDevice = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const [availableDevices, setAvailableDevices] = useState<
        ConnectedLedgerDevice[]
    >([])
    const [selectedDevice, setSelectedDevice] =
        useState<ConnectedLedgerDevice>()

    const goBack = () => nav.goBack()

    const onDeviceSelect = useCallback((device: ConnectedLedgerDevice) => {
        setSelectedDevice(device)
    }, [])

    const onImportClick = useCallback(() => {
        if (selectedDevice) {
            nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS, {
                device: selectedDevice,
            })
        }
    }, [nav, selectedDevice])

    /**
     * Listen for new ledger (nanox) devices
     */
    useEffect(() => {
        const subscription = BleTransport.listen({
            complete: () => {
                debug("complete")
            },
            next: e => {
                debug({ e })
                if (e.type === "add") {
                    const { descriptor, deviceModel } = e

                    const device = {
                        id: descriptor.id,
                        isConnectable: descriptor.isConnectable,
                        localName: descriptor.localName,
                        name: descriptor.name,
                        rssi: descriptor.rssi,
                        deviceModel,
                    } as ConnectedLedgerDevice

                    if (device)
                        setAvailableDevices(prev => {
                            if (prev.find(d => d.id === device.id)) return prev
                            return [...prev, device]
                        })
                }
            },
            error: error => {
                debug({ error })
            },
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const renderItem = useCallback(
        ({ item }: { item: ConnectedLedgerDevice }) => {
            return (
                <LedgerDeviceBox
                    key={item.id}
                    device={item}
                    onPress={() => onDeviceSelect(item)}
                    isSelected={selectedDevice?.id === item.id}
                />
            )
        },
        [onDeviceSelect, selectedDevice],
    )

    const renderSeparator = useCallback(() => <BaseSpacer height={16} />, [])

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
                        <FlatList
                            style={styles.container}
                            data={availableDevices}
                            numColumns={1}
                            horizontal={false}
                            renderItem={renderItem}
                            nestedScrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={renderSeparator}
                            keyExtractor={item => item.id}
                        />
                    </BaseView>

                    <BaseView w={100}>
                        <BaseButton
                            action={onImportClick}
                            w={100}
                            title={LL.COMMON_LBL_IMPORT()}
                            disabled={!selectedDevice}
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
