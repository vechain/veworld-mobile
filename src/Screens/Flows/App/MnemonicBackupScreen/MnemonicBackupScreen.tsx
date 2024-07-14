import React, { forwardRef, useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    MnemonicCard,
    BaseBottomSheet,
    BaseTextInput,
    Layout,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { COLORS } from "~Constants"
import { CryptoUtils, HexUtils } from "~Utils"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

type Props = {} & NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { isCloudKitAvailable, isWalletBackedUp, saveWalletToCloudKit, getWalletByRootAddress, isLoading } =
        useCloudKit()
    const { onCopyToClipboard } = useCopyClipboard()
    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const nav = useNavigation()

    const { mnemonicArray, deviceToBackup } = route.params

    useEffect(() => {
        if (deviceToBackup?.rootAddress) {
            getWalletByRootAddress(deviceToBackup.rootAddress)
        }
    }, [deviceToBackup?.rootAddress, getWalletByRootAddress])

    const onHandleBackupToCloudKit = useCallback(
        async (password: string) => {
            onCloseWarning()

            const salt = HexUtils.generateRandom(256)
            const mnemonic = CryptoUtils.encrypt(mnemonicArray, password, salt)
            await saveWalletToCloudKit({
                mnemonic,
                _rootAddress: deviceToBackup?.rootAddress,
                deviceType: deviceToBackup?.type,
                salt,
            })
            getWalletByRootAddress(deviceToBackup!.rootAddress)
            nav.goBack()
        },
        [deviceToBackup, getWalletByRootAddress, mnemonicArray, nav, onCloseWarning, saveWalletToCloudKit],
    )

    return (
        <>
            <Layout
                body={
                    <BaseView flex={1}>
                        <BaseView flexDirection="row" w={100}>
                            <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                        </BaseView>

                        <BaseSpacer height={24} />

                        <BaseView justifyContent="center">
                            <BaseView flexDirection="row">
                                <BaseIcon
                                    name="apple-icloud"
                                    size={24}
                                    color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}
                                />
                                <BaseSpacer width={8} />
                                <BaseText color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}>
                                    {isWalletBackedUp ? "Backed up to iCloud" : "Not backed up to iCloud"}
                                </BaseText>
                            </BaseView>

                            <BaseSpacer height={24} />

                            <BaseText>
                                {
                                    // eslint-disable-next-line max-len
                                    "Never share these words. Anyone who learns them can steal all of your crypto. VeWorld will never ask you for them."
                                }
                            </BaseText>

                            <BaseSpacer height={16} />

                            <BaseText>
                                {
                                    // eslint-disable-next-line max-len
                                    "The 12 words below are your wallet's recovery phrase. This phrase lets you recover your wallet if you lose your device. Back up it up on iCloud (recommended) or write it down. Or both."
                                }
                            </BaseText>

                            <BaseSpacer height={36} />
                        </BaseView>

                        <BaseView alignItems="flex-start" mb={16}>
                            {!!mnemonicArray.length && (
                                <MnemonicCard mnemonicArray={mnemonicArray} souceScreen="BackupMnemonicBottomSheet" />
                            )}

                            <BaseSpacer height={16} />

                            <BaseButton
                                size="sm"
                                variant="ghost"
                                selfAlign="flex-start"
                                action={() => onCopyToClipboard(mnemonicArray.join(" "), LL.TITLE_MNEMONIC())}
                                title={LL.BTN_MNEMONIC_CLIPBOARD()}
                                disabled={!mnemonicArray.length}
                                rightIcon={
                                    <BaseIcon
                                        name="content-copy"
                                        color={theme.colors.text}
                                        size={12}
                                        style={styles.icon}
                                    />
                                }
                            />

                            {!isCloudKitAvailable && <BaseSpacer height={12} />}
                        </BaseView>
                    </BaseView>
                }
                footer={
                    <>
                        {isCloudKitAvailable && (
                            <>
                                <BaseSpacer height={56} />
                                <BaseButton
                                    isLoading={isLoading}
                                    w={100}
                                    action={onOpen}
                                    title={"Back up on iCloud"}
                                    disabled={isWalletBackedUp || isLoading}
                                />
                            </>
                        )}
                    </>
                }
            />

            <CloudKitWarningBottomSheet ref={warningRef} onHandleBackupToCloudKit={onHandleBackupToCloudKit} />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
        warningIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
        },
    })

type WarningProps = {
    onHandleBackupToCloudKit: (password: string) => void
}

const CloudKitWarningBottomSheet = forwardRef<BottomSheetModalMethods, WarningProps>(
    ({ onHandleBackupToCloudKit }, ref) => {
        const [secureText1, setsecureText1] = useState(true)
        const [secureText2, setsecureText2] = useState(true)

        const [password1, setPassword1] = useState("")
        const [password2, setPassword2] = useState("")

        const { styles } = useThemedStyles(baseStyles)

        const checkPasswordValidity = useCallback(() => {
            // TODO-vas - check password validity
            onHandleBackupToCloudKit(password2)
        }, [onHandleBackupToCloudKit, password2])

        return (
            <BaseBottomSheet snapPoints={["78%"]} ref={ref}>
                <Layout
                    noBackButton
                    noMargin
                    noStaticBottomPadding
                    hasSafeArea={false}
                    fixedBody={
                        <BaseView flex={1}>
                            <BaseText typographyFont="subTitleBold">{"Cloud Backup Password"}</BaseText>
                            <BaseSpacer height={48} />
                            {/* Warning ICON */}
                            <BaseView justifyContent="center" alignItems="center">
                                <BaseView justifyContent="center" bg={COLORS.PASTEL_ORANGE} style={styles.warningIcon}>
                                    <BaseIcon my={8} size={22} name="alert-outline" color={COLORS.MEDIUM_ORANGE} />
                                </BaseView>
                            </BaseView>
                            <BaseSpacer height={48} />
                            <BaseText>
                                {
                                    // eslint-disable-next-line max-len
                                    "This password will secure your secret recovery phrase in the cloud. VeWorld does NOT have access to your password. We can NOT reset it if you lose it, so keep it safe."
                                }
                            </BaseText>
                            <BaseSpacer height={24} />
                            <BaseTextInput
                                placeholder="Chooe password"
                                secureTextEntry={secureText1}
                                rightIcon={secureText1 ? "eye-off" : "eye"}
                                onIconPress={() => setsecureText1(prev => !prev)}
                                value={password1}
                                setValue={setPassword1}
                            />
                            <BaseSpacer height={24} />
                            <BaseTextInput
                                placeholder="Confirm password"
                                secureTextEntry={secureText2}
                                rightIcon={secureText2 ? "eye-off" : "eye"}
                                onIconPress={() => setsecureText2(prev => !prev)}
                                value={password2}
                                setValue={setPassword2}
                            />
                        </BaseView>
                    }
                    footer={
                        <>
                            <BaseSpacer height={48} />
                            <BaseButton title="Proceed" action={checkPasswordValidity} />
                            <BaseSpacer height={24} />
                        </>
                    }
                />
            </BaseBottomSheet>
        )
    },
)
