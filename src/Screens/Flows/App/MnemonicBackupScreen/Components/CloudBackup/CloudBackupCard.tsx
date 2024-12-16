import { useFocusEffect, useNavigation } from "@react-navigation/native"
import Lottie from "lottie-react-native"
import React, { FC, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import {
    BaseIcon,
    BaseText,
    BaseView,
    CardWithHeader,
    ConfirmDeleteCloudBackupBottomSheet,
    DeleteCloudBackupBottomSheet,
    EnableCloudBottomSheet,
    RequireUserPassword,
    WalletBackupStatusRow,
} from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
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
import { Routes } from "~Navigation"
import {
    selectAccounts,
    selectIsAppLoading,
    setDeviceIsBackup,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { DateUtils, PlatformUtils } from "~Utils"
import { getTimeZone } from "react-native-localize"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL, locale } = useI18nContext()
    const navigation = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const isAppLoading = useAppSelector(selectIsAppLoading)
    const accounts = useAppSelector(selectAccounts)

    const { getWalletByRootAddress, deleteWallet, isCloudAvailable } = useCloudBackup()

    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const [isWalletBackedUp, setIsWalletBackedUp] = useState(false)
    const [isCloudError, setIsCloudError] = useState(false)

    const getWallet = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        try {
            const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
            setIsWalletBackedUp(!!wallet)
            setIsCloudError(false)
        } catch {
            setIsWalletBackedUp(false)
            setIsCloudError(true)
        } finally {
            dispatch(setIsAppLoading(false))
        }
    }, [deviceToBackup?.rootAddress, dispatch, getWalletByRootAddress])

    const handleConfirmDelete = useCallback(async () => {
        if (!deviceToBackup?.rootAddress) {
            throw new Error("No root address found")
        }

        dispatch(setIsAppLoading(true))
        try {
            await deleteWallet(deviceToBackup.rootAddress)
            const wallet = await getWalletByRootAddress(deviceToBackup.rootAddress)
            const formattedDate = DateUtils.formatDateTime(
                Date.now(),
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
            )
            dispatch(
                setDeviceIsBackup({
                    rootAddress: deviceToBackup.rootAddress,
                    isBackup: !!wallet,
                    isBackupManual: !!deviceToBackup.isBackedUpManual,
                    date: formattedDate,
                }),
            )
            setIsWalletBackedUp(!!wallet)
            navigation.goBack()
        } catch (error) {
            setIsCloudError(true)
            dispatch(setIsAppLoading(false))
        }
    }, [
        deviceToBackup?.rootAddress,
        deviceToBackup?.isBackedUpManual,
        deleteWallet,
        getWalletByRootAddress,
        locale,
        dispatch,
        setIsWalletBackedUp,
        setIsCloudError,
        navigation,
    ])

    const {
        ref: confirmDeleteBackupRef,
        openWithDelay: onOpenConfirmDeleteBackup,
        onClose: onCloseConfirmDeleteBackup,
    } = useBottomSheetModal()
    const { ref: deleteBackupRef, onOpen: onOpenDeleteBackup, onClose: onCloseDeleteBackup } = useBottomSheetModal()
    const { ref: EnableCloudRef, onOpen: onOpenEnableCloud, onClose: onCloseEnableCloud } = useBottomSheetModal()

    useFocusEffect(
        useCallback(() => {
            if (!isCloudAvailable) {
                return
            }

            if (!accounts.find(account => account.rootAddress === deviceToBackup?.rootAddress)) {
                navigation.goBack()
            } else {
                getWallet()
            }
        }, [accounts, deviceToBackup?.rootAddress, getWallet, isCloudAvailable, navigation]),
    )

    const goToChoosePasswordScreen = useCallback(async () => {
        if (isCloudError) {
            dispatch(setIsAppLoading(true))
            try {
                const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
                const isBackuped = !!wallet
                setIsWalletBackedUp(isBackuped)
                setIsCloudError(false)

                if (!isBackuped && deviceToBackup) {
                    navigation.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                        mnemonicArray,
                        device: deviceToBackup,
                    })
                }
            } catch {
                setIsWalletBackedUp(false)
                setIsCloudError(true)
            } finally {
                dispatch(setIsAppLoading(false))
            }
        } else if (deviceToBackup) {
            navigation.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                mnemonicArray,
                device: deviceToBackup,
            })
        }
    }, [
        deviceToBackup,
        dispatch,
        getWalletByRootAddress,
        isCloudError,
        mnemonicArray,
        navigation,
        setIsCloudError,
        setIsWalletBackedUp,
    ])

    const handleCloudBackupPress = useCallback(() => {
        if (!isCloudAvailable) {
            onOpenEnableCloud()
        } else if (isWalletBackedUp) {
            onOpenDeleteBackup()
        } else if (!isWalletBackedUp) {
            goToChoosePasswordScreen()
        }
    }, [isCloudAvailable, isWalletBackedUp, onOpenEnableCloud, onOpenDeleteBackup, goToChoosePasswordScreen])

    const handleProceedToDelete = useCallback(() => {
        onCloseDeleteBackup()
        onOpenConfirmDeleteBackup(1000)
    }, [onCloseDeleteBackup, onOpenConfirmDeleteBackup])

    const { onPasswordSuccess, checkIdentityBeforeOpening, isPasswordPromptOpen, handleClosePasswordModal } =
        useCheckIdentity({
            onIdentityConfirmed: async () => await handleConfirmDelete(),
            allowAutoPassword: false,
        })

    const handleConfirmDeleteWithAuth = useCallback(() => {
        if (isWalletSecurityBiometrics) {
            return authenticateBiometrics(handleConfirmDelete)
        }
        return checkIdentityBeforeOpening()
    }, [isWalletSecurityBiometrics, authenticateBiometrics, handleConfirmDelete, checkIdentityBeforeOpening])

    return (
        <>
            <BaseView justifyContent="center">
                <CardWithHeader
                    title={LL.TITLE_BACKUP_CLOUD()}
                    iconName="icon-cloud"
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
                    <WalletBackupStatusRow
                        variant={isWalletBackedUp ? "success" : "error"}
                        title={PlatformUtils.isIOS() ? LL.ICLOUD() : LL.GOOGLE_DRIVE()}
                        rightElement={
                            isAppLoading ? (
                                <Lottie
                                    source={theme.isDark ? LoaderDark : LoaderLight}
                                    autoPlay
                                    loop
                                    style={styles.lottie}
                                />
                            ) : (
                                <BaseIcon name="icon-chevron-right" size={14} color={COLORS.DARK_PURPLE} />
                            )
                        }
                        onPress={handleCloudBackupPress}
                        disabled={isAppLoading}
                        loading={isAppLoading}
                    />
                </CardWithHeader>
            </BaseView>

            <DeleteCloudBackupBottomSheet
                ref={deleteBackupRef}
                onClose={onCloseDeleteBackup}
                onProceedToDelete={handleProceedToDelete}
            />

            <ConfirmDeleteCloudBackupBottomSheet
                ref={confirmDeleteBackupRef}
                onClose={onCloseConfirmDeleteBackup}
                onConfirm={handleConfirmDeleteWithAuth}
            />

            <EnableCloudBottomSheet ref={EnableCloudRef} onClose={onCloseEnableCloud} />

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
