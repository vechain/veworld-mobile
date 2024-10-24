import React, { useCallback, useEffect, useMemo } from "react"
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
    BaseCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useCopyClipboard, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { AddressUtils, CryptoUtils, HexUtils, PasswordUtils } from "~Utils"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamListSettings, Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { COLORS, ColorThemeType, DerivationPath } from "~Constants"
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

    const renderAlertCard = useMemo(() => {
        return (
            <BaseCard containerStyle={styles.alertCardContainer}>
                <BaseView w={100}>
                    <BaseView flexDirection="row">
                        <BaseIcon name="alert-outline" size={16} color={theme.colors.alertCards.error.icon} />
                        <BaseSpacer width={8} />
                        <BaseText typographyFont="bodyMedium" color={theme.colors.alertCards.error.title}>
                            {LL.ALERT_TITLE_DONT_SHARE_MNEMONIC()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={4} />
                    <BaseText typographyFont="captionRegular" color={theme.colors.alertDescription} pl={24}>
                        {LL.ALERT_MSG_DONT_SHARE_MNEMONIC()}
                    </BaseText>
                </BaseView>
            </BaseCard>
        )
    }, [LL, styles.alertCardContainer, theme.colors.alertCards.error, theme.colors.alertDescription])

    const renderAlertInline = useMemo(() => {
        return (
            <BaseView style={styles.alertInlineContainer}>
                <BaseView w={100}>
                    <BaseView flexDirection="row">
                        <BaseIcon name="check-circle-outline" size={16} color={theme.colors.alertCards.success.icon} />
                        <BaseSpacer width={8} />
                        <BaseText typographyFont="captionRegular" color={theme.colors.alertCards.success.title}>
                            {LL.ALERT_LAST_BACKUP_TIME()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            </BaseView>
        )
    }, [LL, styles.alertInlineContainer, theme.colors.alertCards.success])

    return (
        <>
            <Layout
                noStaticBottomPadding
                body={
                    <BaseView flex={1}>
                        {renderAlertInline}
                        <BaseSpacer height={24} />
                        <BaseText typographyFont="subSubTitleMedium">{deviceToBackup?.alias}</BaseText>
                        <BaseSpacer height={16} />
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
                                    <BaseSpacer height={16} />
                                </>
                            )}

                            <BaseText typographyFont="captionRegular">{LL.BD_MNEMONIC_PASSWORD_WARNING()}</BaseText>

                            <BaseSpacer height={16} />
                        </BaseView>
                        <BaseCard containerStyle={styles.cardContainer} style={styles.card}>
                            <BaseView px={18} pt={16}>
                                {renderAlertCard}
                                <BaseSpacer height={12} />
                                {!!mnemonicArray.length && (
                                    <MnemonicCard
                                        mnemonicArray={mnemonicArray}
                                        souceScreen="BackupMnemonicBottomSheet"
                                    />
                                )}
                                <BaseSpacer height={16} />
                                <BaseButton
                                    px={0}
                                    py={0}
                                    size="sm"
                                    variant="ghost"
                                    selfAlign="flex-start"
                                    action={() => onCopyToClipboard(mnemonicArray.join(" "), LL.BTN_BACKUP_MENMONIC())}
                                    title={LL.BTN_MNEMONIC_CLIPBOARD()}
                                    typographyFont="smallButtonPrimary"
                                    disabled={!mnemonicArray.length}
                                    textColor={theme.colors.text}
                                    rightIcon={
                                        <BaseIcon
                                            name="content-copy"
                                            color={theme.colors.text}
                                            size={12}
                                            style={styles.icon}
                                        />
                                    }
                                />
                            </BaseView>
                        </BaseCard>
                        <BaseSpacer height={12} />
                        <MnemonicBackupAlert />
                    </BaseView>
                }
                footer={
                    <>
                        {isCloudKitAvailable && (
                            <FadeoutButton
                                isLoading={isLoading}
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        icon: {
            marginLeft: 6,
        },
        card: {
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            paddingVertical: 0,
        },
        cardContainer: {
            display: "flex",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 12,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : theme.colors.cardBorder,
        },
        alertCardContainer: {
            backgroundColor: theme.colors.alertCards.error.background,
            borderColor: theme.colors.alertCards.error.border,
            borderRadius: 8,
            paddingLeft: 2,
            paddingRight: 4,
        },
        alertInlineContainer: {
            backgroundColor: theme.colors.alertCards.success.background,
            borderWidth: 0,
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
        },
    })
