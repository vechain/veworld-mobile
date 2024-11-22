import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import Lottie from "lottie-react-native"
import { StyleSheet } from "react-native"
import { getTimeZone } from "react-native-localize"
import { LoaderDark, LoaderLight } from "~Assets"
import {
    BackupSuccessfulBottomSheet,
    BackupVerifiedBottomSheet,
    BaseIcon,
    BaseText,
    BaseTouchableBox,
    BaseView,
    CardWithHeader,
    CloudKitWarningBottomSheet,
    DeleteCloudBackupBottomSheet,
    RequireUserPassword,
    showErrorToast,
} from "~Components"
import { COLORS, ColorThemeType, DerivationPath, typography } from "~Constants"
import {
    useBiometricsValidation,
    useBottomSheetModal,
    useCheckIdentity,
    useCloudBackup,
    useThemedStyles,
    useWalletSecurity,
} from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { setDeviceIsBackup, useAppDispatch } from "~Storage/Redux"
import { AddressUtils, CryptoUtils, DateUtils, HexUtils, PasswordUtils, PlatformUtils } from "~Utils"
import { useNavigation } from "@react-navigation/native"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const { LL, locale } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const { saveWalletToCloud, getWalletByRootAddress, deleteWallet } = useCloudBackup()

    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const { ref: warningRef, onOpen: onOpenWarning, onClose: onCloseWarning } = useBottomSheetModal()
    const { ref: successRef, onOpen: onOpenSuccess, onClose: onCloseSuccess } = useBottomSheetModal()
    const {
        ref: deleteBackupRef,
        openWithDelay: onOpenDeleteBackup,
        onClose: onCloseDeleteBackup,
    } = useBottomSheetModal()
    const {
        ref: backupVerifiedRef,
        onOpen: onOpenBackupVerified,
        onClose: onCloseBackupVerified,
    } = useBottomSheetModal()

    const getWallet = useCallback(async () => {
        setIsLoading(true)
        const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
        setIsLoading(false)
        setIsWalletBackedUp(!!wallet)
    }, [deviceToBackup?.rootAddress, getWalletByRootAddress])

    useEffect(() => {
        getWallet()
    }, [getWallet])

    const onHandleBackupToCloud = useCallback(
        async (password: string) => {
            setIsLoading(true)
            onCloseWarning()

            if (!deviceToBackup?.xPub) {
                showErrorToast({
                    text1: PlatformUtils.isIOS() ? LL.CLOUDKIT_ERROR_GENERIC() : LL.GOOGLE_DRIVE_ERROR_GENERIC(),
                })
                return
            }

            try {
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
                await getWalletByRootAddress(deviceToBackup.rootAddress)

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

                onCloseWarning()
                setIsWalletBackedUp(true)
                setIsLoading(false)
                onOpenSuccess()
            } catch (error) {
                onCloseWarning()
                setIsLoading(false)
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

    const handleCloudBackupPress = useCallback(() => {
        if (isWalletBackedUp) {
            onOpenBackupVerified()
        } else {
            onOpenWarning()
        }
    }, [isWalletBackedUp, onOpenBackupVerified, onOpenWarning])

    const handleProceedToDelete = useCallback(() => {
        onCloseBackupVerified()
        onOpenDeleteBackup(1000)
    }, [onCloseBackupVerified, onOpenDeleteBackup])

    const handleConfirmDelete = useCallback(async () => {
        if (!deviceToBackup?.rootAddress) {
            throw new Error("No root address found")
        }

        setIsLoading(true)
        try {
            await deleteWallet(deviceToBackup.rootAddress)
            await getWalletByRootAddress(deviceToBackup.rootAddress)

            const formattedDate = DateUtils.formatDateTime(
                Date.now(),
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
            )
            dispatch(
                setDeviceIsBackup({
                    rootAddress: deviceToBackup.rootAddress,
                    isBackup: false,
                    date: formattedDate,
                }),
            )
            setIsWalletBackedUp(false)
            onCloseDeleteBackup()
            nav.goBack()
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            nav.goBack()
        }
    }, [deleteWallet, deviceToBackup?.rootAddress, dispatch, getWalletByRootAddress, locale, nav, onCloseDeleteBackup])

    const { onPasswordSuccess, checkIdentityBeforeOpening, isPasswordPromptOpen, handleClosePasswordModal } =
        useCheckIdentity({
            onIdentityConfirmed: handleConfirmDelete,
            allowAutoPassword: false,
        })

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
                        disabled={isLoading}
                        style={[styles.cloudRowContent]}
                        action={handleCloudBackupPress}>
                        <BaseView style={styles.cloudInfo}>
                            {!isWalletBackedUp ? (
                                <BaseText typographyFont="bodyMedium" color={theme.colors.textReversed}>
                                    {PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE()}
                                </BaseText>
                            ) : (
                                <>
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
                                </>
                            )}
                        </BaseView>
                        {isLoading ? (
                            <Lottie
                                source={isWalletBackedUp ? LoaderDark : theme.isDark ? LoaderDark : LoaderLight}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                        ) : (
                            <BaseIcon
                                name="chevron-right"
                                size={14}
                                color={isWalletBackedUp ? COLORS.DARK_PURPLE : theme.colors.textReversed}
                            />
                        )}
                    </BaseTouchableBox>
                </CardWithHeader>
            </BaseView>

            <CloudKitWarningBottomSheet
                ref={warningRef}
                onHandleBackupToCloudKit={onHandleBackupToCloud}
                openLocation="Backup_Screen"
                isLoading={isLoading}
            />

            <BackupSuccessfulBottomSheet ref={successRef} onClose={onCloseSuccess} onConfirm={onCloseSuccess} />

            <BackupVerifiedBottomSheet
                ref={backupVerifiedRef}
                onClose={onCloseBackupVerified}
                onProceedToDelete={handleProceedToDelete}
            />

            <DeleteCloudBackupBottomSheet
                ref={deleteBackupRef}
                onClose={onCloseDeleteBackup}
                onConfirm={
                    isWalletSecurityBiometrics
                        ? () => authenticateBiometrics(handleConfirmDelete)
                        : checkIdentityBeforeOpening
                }
            />

            <RequireUserPassword
                isOpen={isPasswordPromptOpen}
                onClose={handleClosePasswordModal}
                onSuccess={onPasswordSuccess}
            />
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
