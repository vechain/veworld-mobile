import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    DismissKeyboardView,
    LocationStatusBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { debug } from "~Utils"
import { StyleSheet, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"

import BleTransport from "@ledgerhq/react-native-hw-transport-ble"
import { LedgerDeviceBox } from "../components"
import { FlatList } from "react-native-gesture-handler"
import { Routes } from "~Navigation"
import { ConnectedLedgerDevice } from "~Model"
import Lottie from "lottie-react-native"
import { BlePairingDark } from "~Assets/Lottie"
import * as Haptics from "expo-haptics"
import { LedgerAndroidPermissions } from "../Hooks/LedgerAndroidPermissions"

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

    const { androidPermissionsGranted, checkPermissions } =
        LedgerAndroidPermissions()

    const onImportClick = useCallback(() => {
        if (selectedDevice) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            nav.navigate(Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS, {
                device: selectedDevice,
            })
        }
    }, [nav, selectedDevice])

    /**
     * Listen for new ledger (nanox) devices if bluetooth is enabled
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
                    if (!selectedDevice) setSelectedDevice(device)
                }
            },
            error: error => {
                debug({ error })
            },
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [selectedDevice, androidPermissionsGranted])

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

    const devicesFoundMessage = useMemo(() => {
        if (availableDevices.length === 0) {
            return LL.WALLET_LEDGER_NO_DEVICES_FOUND()
        }
        if (availableDevices.length === 1) {
            return LL.WALLET_LEDGER_ONE_DEVICE_FOUND()
        }
        return LL.WALLET_LEDGER_MORE_DEVICES_FOUND({
            count: availableDevices.length,
        })
    }, [LL, availableDevices.length])
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
                        <Lottie
                            source={BlePairingDark}
                            autoPlay
                            loop
                            style={styles.lottie}
                        />
                        <BaseSpacer height={20} />
                        <BaseText
                            align="center"
                            typographyFont="subTitleBold"
                            my={10}>
                            {devicesFoundMessage}
                        </BaseText>
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
                    {Platform.OS === "android" && !androidPermissionsGranted ? (
                        <BaseView w={100}>
                            <BaseText>
                                {LL.WALLET_LEDGER_ASK_PERMISSIONS_MESSAGE()}
                            </BaseText>
                            <BaseSpacer height={16} />
                            <BaseButton
                                action={checkPermissions}
                                w={100}
                                title={LL.WALLET_LEDGER_ASK_PERMISSIONS_BUTTON()}
                            />
                        </BaseView>
                    ) : (
                        <BaseView w={100}>
                            <BaseButton
                                action={onImportClick}
                                w={100}
                                title={LL.COMMON_LBL_IMPORT()}
                                disabled={!selectedDevice}
                            />
                        </BaseView>
                    )}
                </BaseView>

                <BaseSpacer height={40} />
                <BluetoothStatusBottomSheet />
                <LocationStatusBottomSheet />
            </BaseSafeArea>
        </DismissKeyboardView>
    )
}

const styles = StyleSheet.create({
    backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
    container: {
        width: "100%",
    },
    lottie: {
        width: "100%",
        height: 100,
    },
})
