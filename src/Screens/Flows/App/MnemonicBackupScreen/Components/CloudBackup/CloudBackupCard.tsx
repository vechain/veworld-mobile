import React, { FC, useCallback, useEffect, useRef } from "react"
import { StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CloudKitWarningBottomSheet,
    showErrorToast,
    BackupSuccessfulBottomSheet,
    VerifyAndDeleteCloudBackupBottomSheet,
    DeleteCloudBackupBottomSheet,
} from "~Components"
import { CardWithHeader } from "~Components/Reusable/CardWithHeader"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType, DerivationPath } from "~Constants"
import { LocalDevice } from "~Model"
import { AddressUtils, CryptoUtils, HexUtils, PasswordUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const backupInProgress = useRef(false)

    const { isWalletBackedUp, saveWalletToCloudKit, getWalletByRootAddress, isLoading, deleteWallet } = useCloudKit()

    const { ref: warningRef, onOpen: onOpenWarning, onClose: onCloseWarning } = useBottomSheetModal()
    const { ref: successRef, onOpen: onOpenSuccess, onClose: onCloseSuccess } = useBottomSheetModal()
    const {
        ref: verifyAndDeleteRef,
        onOpen: onOpenVerifyAndDelete,
        onClose: onCloseVerifyAndDelete,
    } = useBottomSheetModal()
    const { ref: deleteRef, onOpen: onOpenDelete, onClose: onCloseDelete } = useBottomSheetModal()

    useEffect(() => {
        if (deviceToBackup?.rootAddress) {
            getWalletByRootAddress(deviceToBackup.rootAddress)
        }
    }, [deviceToBackup?.rootAddress, getWalletByRootAddress])

    useEffect(() => {
        if (isWalletBackedUp && backupInProgress.current) {
            backupInProgress.current = false
            onOpenSuccess()
        } else if (!isWalletBackedUp && backupInProgress.current) {
            backupInProgress.current = false
        }
    }, [isWalletBackedUp, onOpenSuccess])

    const onHandleBackupToCloudKit = useCallback(
        async (password: string) => {
            if (!deviceToBackup?.xPub) {
                showErrorToast({
                    text1: LL.CLOUDKIT_ERROR_GENERIC(),
                })
                return
            }

            backupInProgress.current = true
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

            await getWalletByRootAddress(deviceToBackup!.rootAddress)
            onCloseWarning()
        },
        [LL, deviceToBackup, getWalletByRootAddress, mnemonicArray, onCloseWarning, saveWalletToCloudKit],
    )

    const handleConfirmDelete = useCallback(async () => {
        try {
            if (!deviceToBackup?.rootAddress) {
                throw new Error("No root address found")
            }
            await deleteWallet(deviceToBackup.rootAddress)
            await getWalletByRootAddress(deviceToBackup.rootAddress)
            onCloseDelete()
        } catch (error) {
            showErrorToast({
                text1: LL.CLOUDKIT_ERROR_GENERIC(),
            })
        }
    }, [LL, deleteWallet, deviceToBackup?.rootAddress, getWalletByRootAddress, onCloseDelete])

    const handleCloudBackupPress = useCallback(() => {
        if (isWalletBackedUp) {
            onOpenVerifyAndDelete()
        } else {
            onOpenWarning()
        }
    }, [isWalletBackedUp, onOpenVerifyAndDelete, onOpenWarning])

    const handleProceedToDelete = useCallback(() => {
        onOpenDelete()
    }, [onOpenDelete])

    return (
        <>
            <BaseView justifyContent="center">
                <CardWithHeader
                    title={LL.TITLE_BACKUP_CLOUD()}
                    iconName="cloud-outline"
                    sideHeader={
                        <BaseView style={styles.sideHeader}>
                            <BaseText
                                typographyFont="smallCaptionMedium"
                                px={6}
                                py={2}
                                color={theme.isDark ? COLORS.WHITE : COLORS.GREY_600}>
                                {LL.RECOMMENDED()}
                            </BaseText>
                        </BaseView>
                    }>
                    <BaseTouchableBox
                        containerStyle={[
                            styles.cloudRow,
                            {
                                backgroundColor: isWalletBackedUp
                                    ? theme.colors.successBackground
                                    : theme.colors.primary,
                            },
                        ]}
                        style={styles.cloudRowContent}
                        action={handleCloudBackupPress}>
                        <BaseView style={styles.cloudInfo}>
                            {!isWalletBackedUp ? (
                                <BaseText typographyFont="bodyMedium" color={theme.colors.textReversed}>
                                    {LL.ICLOUD()}
                                </BaseText>
                            ) : (
                                <BaseView flexDirection="row">
                                    <BaseIcon name="check-circle-outline" size={16} color={theme.colors.successIcon} />
                                    <BaseText style={styles.verifyCloudText} typographyFont="captionRegular">
                                        {LL.BTN_VERIFY_ICLOUD_BACKUP()}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                        <BaseIcon name="chevron-right" size={14} color={theme.colors.textReversed} />
                    </BaseTouchableBox>
                </CardWithHeader>
            </BaseView>
            <CloudKitWarningBottomSheet
                ref={warningRef}
                onHandleBackupToCloudKit={onHandleBackupToCloudKit}
                openLocation="Backup_Screen"
                isLoading={isLoading}
            />
            <BackupSuccessfulBottomSheet ref={successRef} onClose={onCloseSuccess} onConfirm={onCloseSuccess} />
            {deviceToBackup && (
                <VerifyAndDeleteCloudBackupBottomSheet
                    ref={verifyAndDeleteRef}
                    onClose={onCloseVerifyAndDelete}
                    onProceedToDelete={handleProceedToDelete}
                />
            )}
            <DeleteCloudBackupBottomSheet
                ref={deleteRef}
                onClose={onCloseDelete}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
            />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cloudRow: {
            borderRadius: 8,
            borderWidth: 1,
            padding: 0,
            borderColor: COLORS.GREEN_100,
        },
        cloudRowContent: {
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 14,
            paddingRight: 12,
            paddingVertical: 10,
        },
        cloudInfo: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
        },
        verifyCloudText: {
            paddingLeft: 12,
            color: COLORS.DARK_PURPLE,
        },
        sideHeader: {
            borderWidth: 1,
            borderRadius: 4,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300,
            backgroundColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
        },
    })
