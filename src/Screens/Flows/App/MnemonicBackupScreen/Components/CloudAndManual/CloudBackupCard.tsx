import { BaseIcon, BaseText, BaseTouchableBox, BaseView, CloudKitWarningBottomSheet, showErrorToast } from "~Components"
import React, { FC, useCallback, useEffect } from "react"
import { useI18nContext } from "~i18n"
import { useBottomSheetModal, useCloudKit, useThemedStyles } from "~Hooks"
import { COLORS, DerivationPath } from "~Constants"
import { StyleSheet } from "react-native"
import { LocalDevice } from "~Model"
import { AddressUtils, CryptoUtils, HexUtils, PasswordUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"
import { IconHeaderCard } from "~Components/Reusable/IconHeaderCard"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const nav = useNavigation()

    const { isCloudKitAvailable, isWalletBackedUp, saveWalletToCloudKit, getWalletByRootAddress } = useCloudKit()

    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
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
            <BaseView justifyContent="center">
                <IconHeaderCard title={LL.TITLE_BACKUP_CLOUD()} iconName="cloud-outline">
                    {!isCloudKitAvailable && (
                        <BaseTouchableBox
                            containerStyle={[
                                styles.cloudRow,
                                {
                                    backgroundColor: isWalletBackedUp
                                        ? theme.colors.alertCards.success.background
                                        : theme.colors.primary,
                                },
                            ]}
                            style={styles.cloudRowContent}
                            action={onOpen}>
                            <BaseView style={styles.cloudInfo}>
                                {!isWalletBackedUp ? (
                                    <BaseText typographyFont="bodyMedium" color={theme.colors.textReversed}>
                                        {LL.ICLOUD()}
                                    </BaseText>
                                ) : (
                                    <BaseView flexDirection="row">
                                        <BaseIcon
                                            name="check-circle-outline"
                                            size={16}
                                            color={theme.colors.alertCards.success.icon}
                                        />
                                        <BaseText style={styles.verifyCloudText} typographyFont="captionRegular">
                                            {LL.BTN_VERIFY_ICLOUD_BACKUP()}
                                        </BaseText>
                                    </BaseView>
                                )}
                            </BaseView>
                            <BaseIcon name="chevron-right" size={14} color={theme.colors.textReversed} />
                        </BaseTouchableBox>
                    )}
                </IconHeaderCard>
            </BaseView>
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
            paddingVertical: 12,
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
    })
