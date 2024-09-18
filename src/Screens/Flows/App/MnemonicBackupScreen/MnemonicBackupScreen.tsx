import React, { useCallback, useEffect } from "react"
import {
    BaseButton,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
    MnemonicCard,
    Layout,
    CloudKitWarningBottomSheet,
    showErrorToast,
    MnemonicBackupAlert,
    FadeoutButton,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { AddressUtils, CryptoUtils, HexUtils, PasswordUtils } from "~Utils"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { DerivationPath } from "~Constants"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {} & NativeStackScreenProps<RootStackParamListSettings, Routes.ICLOUD_MNEMONIC_BACKUP>

export const MnemonicBackupScreen = ({ route }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const isIOSDevice = isIOS()
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

            if (!deviceToBackup?.xPub) {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                return
            }

            const firstAccountAddress = AddressUtils.getAddressFromXPub(deviceToBackup.xPub, 0)
            const salt = HexUtils.generateRandom(256)
            const iv = PasswordUtils.getRandomIV(16)
            const mnemonic = await CryptoUtils.encrypt(mnemonicArray, password, salt, iv)
            await saveWalletToCloudKit({
                mnemonic,
                _rootAddress: deviceToBackup?.rootAddress,
                deviceType: deviceToBackup?.type,
                firstAccountAddress,
                salt,
                iv,
                derivationPath: deviceToBackup?.derivationPath ?? DerivationPath.VET,
            })

            getWalletByRootAddress(deviceToBackup!.rootAddress)
            nav.goBack()
        },
        [LL, deviceToBackup, getWalletByRootAddress, mnemonicArray, nav, onCloseWarning, saveWalletToCloudKit],
    )

    return (
        <>
            <Layout
                noStaticBottomPadding
                body={
                    <BaseView flex={1}>
                        <BaseView flexDirection="row" w={100}>
                            <BaseText typographyFont="subTitleBold">{LL.BTN_BACKUP_MENMONIC()}</BaseText>
                        </BaseView>

                        <BaseSpacer height={24} />

                        <BaseView justifyContent="center">
                            {isIOSDevice && (
                                <>
                                    <BaseView flexDirection="row">
                                        <BaseIcon
                                            name="apple-icloud"
                                            size={24}
                                            color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}
                                        />
                                        <BaseSpacer width={8} />
                                        <BaseText color={isWalletBackedUp ? theme.colors.success : theme.colors.danger}>
                                            {isWalletBackedUp
                                                ? LL.BD_BACKED_UP_TO_CLOUD()
                                                : LL.BD_NOT_BACKED_UP_TO_CLOUD()}
                                        </BaseText>
                                    </BaseView>
                                    <BaseSpacer height={24} />
                                </>
                            )}

                            <BaseText>{LL.BD_MNEMONIC_WARMNING()}</BaseText>

                            <BaseSpacer height={16} />

                            <BaseText>{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>

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
                            <BaseSpacer height={24} />

                            <MnemonicBackupAlert />

                            <BaseSpacer height={!isCloudKitAvailable ? 12 : 64} />
                        </BaseView>
                    </BaseView>
                }
                footer={
                    <>
                        {isCloudKitAvailable && (
                            <FadeoutButton
                                isLoading={isLoading}
                                // w={100}
                                bottom={0}
                                mx={0}
                                width={"auto"}
                                action={onOpen}
                                title={"Back up on iCloud"}
                                disabled={isWalletBackedUp || isLoading}
                            />
                        )}
                    </>
                }
            />

            <CloudKitWarningBottomSheet
                ref={warningRef}
                onHandleBackupToCloudKit={onHandleBackupToCloudKit}
                openLocation="Backup_Screen"
            />
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
    })
