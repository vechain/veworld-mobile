import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    BluetoothStatusBottomSheet,
    DismissKeyboardView,
    FadeoutButton,
    Layout,
    LocationStatusBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Platform, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { LedgerDeviceBox } from "../components"
import { FlatList } from "react-native-gesture-handler"
import { Routes } from "~Navigation"
import { ConnectedLedgerDevice } from "~Model"
import Lottie from "lottie-react-native"
import { BlePairingDark } from "~Assets/Lottie"
import * as Haptics from "expo-haptics"
import { LedgerAndroidPermissions } from "../Hooks/LedgerAndroidPermissions"
import { useAnalyticTracking, useScanLedgerDevices } from "~Hooks"
import { AnalyticsEvent } from "~Constants"
import { PlatformUtils } from "~Utils"
import { selectHasOnboarded, useAppSelector } from "~Storage/Redux"

export const SelectLedgerDevice = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const track = useAnalyticTracking()
    const userHasOnboarded = useAppSelector(selectHasOnboarded)

    const [selectedDevice, setSelectedDevice] = useState<ConnectedLedgerDevice>()

    const onDeviceSelect = useCallback((device: ConnectedLedgerDevice) => {
        setSelectedDevice(device)
    }, [])

    const { androidPermissionsGranted, checkPermissions } = LedgerAndroidPermissions()

    const onAddDevice = useCallback(
        (device: ConnectedLedgerDevice) => {
            if (!selectedDevice) setSelectedDevice(device)
        },
        [selectedDevice],
    )

    const readyToScan = useMemo(() => {
        if (PlatformUtils.isAndroid()) {
            return androidPermissionsGranted
        } else return true
    }, [androidPermissionsGranted])

    const { availableDevices, unsubscribe, scanForDevices } = useScanLedgerDevices({
        onAddDevice,
        readyToScan,
    })

    const onImportClick = useCallback(() => {
        if (selectedDevice) {
            unsubscribe()
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            nav.navigate(Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS, {
                device: selectedDevice,
            })
            track(AnalyticsEvent.IMPORT_HW_SELECTED_LEDGER)
        }
    }, [unsubscribe, nav, selectedDevice, track])

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

    useEffect(() => {
        scanForDevices()
    }, [scanForDevices])

    useEffect(() => {
        track(AnalyticsEvent.IMPORT_HW_PAGE_LOADED)
        // Tracking event used to detect when start the process to import a new hardware wallet
        // this in combination with the WALLET_GENERATION result help to track bugs on the
        // Ledger connection
        track(AnalyticsEvent.IMPORT_HW_LEDGER_START, { context: userHasOnboarded ? "management" : "onboarding" })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Layout
            safeAreaTestID="Select_Hw_Device_Screen"
            noStaticBottomPadding
            title={LL.WALLET_LEDGER_SELECT_DEVICE_TITLE()}
            fixedHeader={
                <>
                    <BaseView>
                        <BaseText typographyFont="body" my={16}>
                            {LL.WALLET_LEDGER_SELECT_DEVICE_SB()}
                        </BaseText>
                    </BaseView>
                    <BaseView alignSelf="flex-start" w={100}>
                        <Lottie source={BlePairingDark} autoPlay loop style={styles.lottie} />
                        <BaseText align="center" typographyFont="subTitleBold" my={10}>
                            {devicesFoundMessage}
                        </BaseText>
                    </BaseView>
                </>
            }
            body={
                <DismissKeyboardView>
                    <BaseSafeArea grow={1} style={styles.safeArea}>
                        <BaseView alignItems="center" justifyContent="space-between" flexGrow={1}>
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

                        <BaseSpacer height={40} />
                        <BluetoothStatusBottomSheet />
                        <LocationStatusBottomSheet />
                    </BaseSafeArea>
                </DismissKeyboardView>
            }
            footer={
                Platform.OS === "android" && !androidPermissionsGranted ? (
                    <BaseView w={100}>
                        <BaseText>{LL.WALLET_LEDGER_ASK_PERMISSIONS_MESSAGE()}</BaseText>
                        <BaseSpacer height={16} />
                        <BaseButton
                            action={checkPermissions}
                            w={100}
                            title={LL.WALLET_LEDGER_ASK_PERMISSIONS_BUTTON()}
                        />
                    </BaseView>
                ) : (
                    <FadeoutButton
                        action={onImportClick}
                        title={LL.COMMON_LBL_IMPORT()}
                        disabled={!selectedDevice}
                        bottom={0}
                        mx={0}
                        width={"auto"}
                    />
                )
            }
        />
    )
}

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: 20,
    },
    container: {
        width: "100%",
    },
    lottie: {
        width: "100%",
        height: 100,
    },
})
