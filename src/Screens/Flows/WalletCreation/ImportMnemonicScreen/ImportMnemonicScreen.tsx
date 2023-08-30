import React, { useState } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import * as Clipboard from "expo-clipboard"
import { useAnalyticTracking, useDeviceUtils, useTheme } from "~Hooks"
import { CryptoUtils, SeedUtils, warn } from "~Utils"
import { Keyboard, StyleSheet } from "react-native"
import { Routes } from "~Navigation"
import { ImportMnemonicInput } from "./Components/ImportMnemonicInput"
import { useNavigation } from "@react-navigation/native"
import {
    selectAreDevFeaturesEnabled,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { selectHasOnboarded } from "~Storage/Redux/Selectors"
import { setMnemonic } from "~Storage/Redux/Actions"
import HapticsService from "~Services/HapticsService"
import { AnalyticsEvent } from "~Constants"

const DEMO_MNEMONIC =
    "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

export const ImportMnemonicScreen = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const theme = useTheme()
    const track = useAnalyticTracking()

    const userHasOnboarded = useAppSelector(selectHasOnboarded)
    const areDevFeaturesEnabled = useAppSelector(selectAreDevFeaturesEnabled)

    const { getDeviceFromMnemonic } = useDeviceUtils()

    const [localMnemonic, setLocalMnemonic] = useState<string>("")
    const [isError, setIsError] = useState<string>("")
    const [isDisabled, setIsDisabled] = useState(true)

    const onVerify = (_mnemonic: string) => {
        const sanitisedMnemonic = SeedUtils.sanifySeed(_mnemonic).join(" ")
        if (CryptoUtils.verifyMnemonic(sanitisedMnemonic)) {
            try {
                getDeviceFromMnemonic(sanitisedMnemonic)
            } catch (e) {
                warn("onVerify", e)
                HapticsService.triggerNotification({ level: "Error" })
                setIsError(LL.ERROR_WALLET_ALREADY_EXISTS())
                return
            }

            dispatch(setMnemonic(sanitisedMnemonic))

            HapticsService.triggerImpact({ level: "Medium" })
            track(AnalyticsEvent.IMPORT_MNEMONIC_SUBMITTED)
            if (userHasOnboarded) {
                nav.navigate(Routes.WALLET_SUCCESS)
            } else {
                nav.navigate(Routes.APP_SECURITY)
            }
        } else {
            HapticsService.triggerNotification({ level: "Error" })
            setIsError(LL.ERROR_INCORRECT_MNEMONIC())
            track(AnalyticsEvent.IMPORT_MNEMONIC_FAILED)
        }
    }

    const onPasteFromClipboard = async () => {
        let isString = await Clipboard.hasStringAsync()
        if (isString) {
            let _seed = await Clipboard.getStringAsync()
            let sanified = SeedUtils.sanifySeed(_seed)
            setLocalMnemonic(sanified.join(" "))
            if (sanified.length === 12) {
                HapticsService.triggerImpact({ level: "Light" })
                setIsDisabled(false)
                Keyboard.dismiss()
            } else {
                HapticsService.triggerNotification({ level: "Error" })
                setIsDisabled(true)
                setIsError(LL.ERROR_INCORRECT_MNEMONIC())
            }
        }
    }

    const onDemoMnemonicClick = () => {
        setLocalMnemonic(DEMO_MNEMONIC)
        onVerify(DEMO_MNEMONIC)
    }

    const onChangeText = (text: string) => {
        let wordCounter = text.split(" ").filter(str => str !== "").length
        setLocalMnemonic(text)
        if (wordCounter === 12) {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }
    }

    const onClearSeed = () => {
        HapticsService.triggerImpact({ level: "Light" })
        setLocalMnemonic("")
        setIsError("")
    }

    return (
        <DismissKeyboardView>
            <Layout
                body={
                    <BaseView justifyContent="space-between">
                        <BaseView>
                            <BaseView flexDirection="row" w={100}>
                                <BaseText typographyFont="title">
                                    {LL.TITLE_WALLET_IMPORT_LOCAL()}
                                </BaseText>
                                {areDevFeaturesEnabled && (
                                    <BaseButton
                                        size="md"
                                        variant="link"
                                        action={onDemoMnemonicClick}
                                        title="DEV:DEMO"
                                    />
                                )}
                            </BaseView>
                            <BaseText typographyFont="body" my={10}>
                                {LL.BD_WALLET_IMPORT_LOCAL()}
                            </BaseText>

                            <BaseSpacer height={20} />

                            <BaseView flexDirection="row" alignSelf="flex-end">
                                <BaseIcon
                                    name={"content-paste"}
                                    size={32}
                                    style={styles.icon}
                                    bg={theme.colors.secondary}
                                    action={onPasteFromClipboard}
                                />
                                <BaseIcon
                                    name={"trash-can-outline"}
                                    size={32}
                                    bg={theme.colors.secondary}
                                    action={onClearSeed}
                                />
                            </BaseView>

                            <BaseSpacer height={40} />

                            <ImportMnemonicInput
                                mnemonic={localMnemonic}
                                onChangeText={onChangeText}
                                isError={!!isError}
                            />
                            {!!isError && (
                                <BaseText my={10} color={theme.colors.danger}>
                                    {isError}
                                </BaseText>
                            )}
                        </BaseView>
                    </BaseView>
                }
                footer={
                    <BaseView w={100}>
                        <BaseButton
                            action={() => onVerify(localMnemonic)}
                            w={100}
                            title={LL.BTN_IMPORT_WALLET_VERIFY()}
                            disabled={isDisabled}
                        />
                    </BaseView>
                }
            />
        </DismissKeyboardView>
    )
}

const styles = StyleSheet.create({
    icon: { marginHorizontal: 20 },
})
