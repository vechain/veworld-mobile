import React, { useCallback, useEffect } from "react"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    ConnectionErrorBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"

import { StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { NativeStackScreenProps } from "@react-navigation/native-stack"
import {
    RootStackParamListCreateWalletApp,
    RootStackParamListOnboarding,
    Routes,
} from "~Navigation"

import { useBottomSheetModal, useLedger, useTheme } from "~Hooks"

import * as Haptics from "expo-haptics"
import { FlatList } from "react-native-gesture-handler"

type Props = {} & NativeStackScreenProps<
    RootStackParamListOnboarding & RootStackParamListCreateWalletApp,
    Routes.IMPORT_HW_LEDGER_ENABLE_ADDITIONAL_SETTINGS
>

type Step = {
    title: string
    desc: string
}

export const EnableAdditionalSettings: React.FC<Props> = ({ route }) => {
    const { device } = route.params
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const theme = useTheme()

    const { ref, onOpen, onClose } = useBottomSheetModal()

    const onConnectionError = useCallback(() => {
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        onOpen()
    }, [onOpen])

    const {
        rootAccount,
        errorCode,
        openOrFinalizeConnection,
        isConnecting,
        setTimerEnabled,
    } = useLedger({
        deviceId: device.id,
        waitFirstManualConnection: true,
        onConnectionError,
    })

    const onConnectionErrorDismiss = useCallback(() => {
        setTimerEnabled(false)
    }, [setTimerEnabled])

    const onConfirm = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        await openOrFinalizeConnection()
    }, [openOrFinalizeConnection])

    /**
     * Whenever we are able to get the root account from ledger, we can navigate to the next screen
     */
    useEffect(() => {
        const triggerHapticsAndNavigate = async () => {
            if (!rootAccount) return
            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            )
            nav.navigate(Routes.IMPORT_HW_LEDGER_SELECT_ACCOUNTS, {
                rootAccount,
                device,
            })
        }
        if (!rootAccount) return
        triggerHapticsAndNavigate()
    }, [rootAccount, device, nav])

    /**
     * close the bottom sheet modal when error disappears
     */
    useEffect(() => {
        if (!errorCode) {
            onClose()
        }
    }, [errorCode, onClose])

    const Steps: Step[] = [
        {
            title: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_1(),
            desc: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_1_DESC(),
        },
        {
            title: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_2(),
            desc: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_2_DESC(),
        },
        {
            title: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_3(),
            desc: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_3_DESC(),
        },
        {
            title: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_4(),
            desc: LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_STEP_4_DESC(),
        },
    ]

    const renderSeparator = useCallback(() => <BaseSpacer height={32} />, [])

    const renderStep = useCallback(
        ({ item, index }: { item: Step; index: number }) => (
            <BaseView
                key={index}
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-start"
                w={100}>
                <BaseText
                    bg={theme.colors.text}
                    color={theme.colors.textReversed}
                    typographyFont="bodyBold"
                    px={8}
                    py={2.5}
                    borderRadius={50}>
                    {index + 1}
                </BaseText>
                <BaseView ml={12}>
                    <BaseText typographyFont="subSubTitle">
                        {item.title}
                    </BaseText>
                    <BaseText typographyFont="body" mt={4}>
                        {item.desc}
                    </BaseText>
                </BaseView>
            </BaseView>
        ),
        [theme],
    )

    return (
        <BaseSafeArea grow={1}>
            <ConnectionErrorBottomSheet
                onDismiss={onConnectionErrorDismiss}
                ref={ref}
                error={errorCode}
            />
            <BackButtonHeader />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start" w={100}>
                    <BaseText typographyFont="title">
                        {LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_TITLE()}
                    </BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {LL.WALLET_LEDGER_ENABLE_ADDITION_SETTINGS_SB()}
                    </BaseText>
                </BaseView>
                <BaseView w={100}>
                    <FlatList
                        style={styles.container}
                        data={Steps}
                        numColumns={1}
                        horizontal={false}
                        renderItem={renderStep}
                        nestedScrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={renderSeparator}
                        keyExtractor={(_item, index) => index.toString()}
                    />
                </BaseView>

                <BaseView w={100}>
                    <BaseButton
                        action={onConfirm}
                        isLoading={isConnecting}
                        disabled={isConnecting}
                        w={100}
                        title={LL.COMMON_LBL_IMPORT()}
                    />
                </BaseView>
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    backIcon: { marginHorizontal: 20, alignSelf: "flex-start" },
    container: {
        width: "100%",
    },
})
