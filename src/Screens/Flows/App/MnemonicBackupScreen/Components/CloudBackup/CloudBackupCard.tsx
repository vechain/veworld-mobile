import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import Lottie from "lottie-react-native"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import { LoaderDark, LoaderLight } from "~Assets"
import {
    BaseIcon,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CardWithHeader,
    CloudKitWarningBottomSheet,
    showErrorToast,
    BackupSuccessfulBottomSheet,
} from "~Components"
import { COLORS, ColorThemeType, DerivationPath, typography } from "~Constants"
import { useBottomSheetModal, useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { AddressUtils, CryptoUtils, DateUtils, HexUtils, PasswordUtils, PlatformUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const { saveWalletToCloud, getWalletByRootAddress } = useCloudBackup()

    const { ref: warningRef, onOpen, onClose: onCloseWarning } = useBottomSheetModal()
    const { ref: successRef, onOpen: onOpenSuccess, onClose: onCloseSuccess } = useBottomSheetModal()

    const getWallet = useCallback(async () => {
        setIsLoading(true)
        const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
        setIsLoading(false)

        setIsWalletBackedUp(!!wallet)
    }, [deviceToBackup?.rootAddress, getWalletByRootAddress])

    useEffect(() => {
        getWallet()
    }, [getWallet])

    const onHandleBackupToCloudKit = useCallback(
        async (password: string) => {
            try {
                setIsLoading(true)
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
                await saveWalletToCloud({
                    mnemonic,
                    _rootAddress: deviceToBackup?.rootAddress,
                    deviceType: deviceToBackup?.type,
                    firstAccountAddress,
                    salt,
                    iv,
                    derivationPath: deviceToBackup?.derivationPath ?? DerivationPath.VET,
                })

                setIsLoading(false)
                setIsWalletBackedUp(true)

                const formattedDate = DateUtils.formatDateTime(
                    Date.now(),
                    locale,
                    getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
                )
                dispatch(
                    setDeviceIsBackup({
                        rootAddress: deviceToBackup.rootAddress,
                        isBackup: true,
                        date: formattedDate,
                    }),
                )
                await getWalletByRootAddress(deviceToBackup.rootAddress)
                onCloseWarning()
                setIsWalletBackedUp(true)
                setIsLoading(false)
                onOpenSuccess()
            } catch (error) {
                setIsLoading(false)
                showErrorToast({
                    text1: PlatformUtils.isIOS() ? LL.CLOUDKIT_ERROR_GENERIC() : LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                })
            }
        },
        [
            LL,
            deviceToBackup?.derivationPath,
            deviceToBackup?.rootAddress,
            deviceToBackup?.type,
            deviceToBackup?.xPub,
            dispatch,
            getWalletByRootAddress,
            locale,
            mnemonicArray,
            onCloseWarning,
            onOpenSuccess,
            saveWalletToCloud,
        ],
    )

    const computedStyles = useMemo(
        () => ({
            ...styles.cloudRow,
            backgroundColor: isWalletBackedUp ? theme.colors.successVariant.background : theme.colors.primary,
            borderColor: isWalletBackedUp ? theme.colors.successVariant.borderLight : theme.colors.primary,
        }),
        [
            styles.cloudRow,
            isWalletBackedUp,
            theme.colors.successVariant.background,
            theme.colors.successVariant.borderLight,
            theme.colors.primary,
        ],
    )

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
                        containerStyle={computedStyles}
                        disabled={isWalletBackedUp || isLoading}
                        style={[styles.cloudRowContent]}
                        action={onOpen}>
                        <BaseView style={styles.cloudInfo}>
                            {!isWalletBackedUp ? (
                                <BaseText typographyFont="bodyMedium" color={theme.colors.textReversed}>
                                    {PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE()}
                                </BaseText>
                            ) : (
                                <BaseView flexDirection="row">
                                    <BaseIcon
                                        name="check-circle-outline"
                                        size={16}
                                        color={theme.colors.successVariant.icon}
                                    />
                                    <BaseText style={styles.verifyCloudText} typographyFont="captionRegular">
                                        {LL.BD_BACKED_UP({
                                            cloudType: PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE(),
                                        })}
                                    </BaseText>
                                </BaseView>
                            )}
                        </BaseView>
                        {isLoading ? (
                            <Lottie
                                source={theme.isDark ? LoaderDark : LoaderLight}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        ) : (
                            !isWalletBackedUp && (
                                <BaseIcon name="chevron-right" size={14} color={theme.colors.textReversed} />
                            )
                        )}
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
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        cloudRow: {
            borderRadius: 8,
            borderWidth: 1,
        },
        cloudRowContent: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
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
            lineHeight: typography.lineHeight.bodyMedium,
        },
        sideHeader: {
            borderWidth: 1,
            borderRadius: 4,
            borderColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_300,
            backgroundColor: theme.isDark ? COLORS.TRANSPARENT : COLORS.GREY_100,
        },
        lottie: {
            width: 28,
            height: 20,
            marginVertical: -2,
        },
    })
