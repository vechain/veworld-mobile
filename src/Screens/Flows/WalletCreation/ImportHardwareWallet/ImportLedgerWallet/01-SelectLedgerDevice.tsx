import React, { useCallback, useEffect, useState } from "react"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { debug } from "~Common"
import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerDeviceBox } from "../components"
import { FlatList } from "react-native-gesture-handler"
import { Routes } from "~Navigation"
import { ConnectedLedgerDevice } from "~Model"
import { ImportLedgerSvg } from "~Assets"

export const SelectLedgerDevice = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const [availableDevices, setAvailableDevices] = useState<
        ConnectedLedgerDevice[]
    >([])
    const [selectedDevice, setSelectedDevice] =
        useState<ConnectedLedgerDevice>()

    const onDeviceSelect = useCallback((device: ConnectedLedgerDevice) => {
        setSelectedDevice(device)
    }, [])

    const onImportClick = useCallback(() => {
        if (selectedDevice) {
            nav.navigate(Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS, {
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

                    const device: ConnectedLedgerDevice = {
                        id: descriptor.id,
                        isConnectable: descriptor.isConnectable,
                        localName: descriptor.localName,
                        name: descriptor.name,
                        rssi: descriptor.rssi,
                        productName: deviceModel.productName,
                    }

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
                <BackButtonHeader />
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}
                    mx={20}>
                    <BaseView alignSelf="flex-start" w={100}>
                        <BaseText typographyFont="title">
                            {LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
                        </BaseText>
                        <BaseText typographyFont="body" my={10}>
                            {LL.WALLET_LEDGER_SELECT_DEVICE_SB()}
                        </BaseText>

                        <BaseSpacer height={20} />
                        {!availableDevices.length && (
                            <ImportLedgerSvg width={"100%"} />
                        )}
                        {availableDevices.length > 0 && (
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
                        )}
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
