import { useFocusEffect, useNavigation } from "@react-navigation/native"
import Lottie from "lottie-react-native"
import React, { FC, useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import { LoaderDark, LoaderLight } from "~Assets"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView, CardWithHeader } from "~Components"
import { COLORS, ColorThemeType, typography } from "~Constants"
import { useCloudBackup, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { LocalDevice } from "~Model"
import { Routes } from "~Navigation"
import { selectIsAppLoading, setIsAppLoading, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"

type Props = {
    mnemonicArray: string[]
    deviceToBackup?: LocalDevice
}

export const CloudBackupCard: FC<Props> = ({ mnemonicArray, deviceToBackup }) => {
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()
    const navigaiton = useNavigation()
    const { styles, theme } = useThemedStyles(baseStyles)

    const isAppLoading = useAppSelector(selectIsAppLoading)

    const [isWalletBackedUp, setIsWalletBackedUp] = useState(true)

    const { getWalletByRootAddress } = useCloudBackup()

    const getWallet = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
        setIsWalletBackedUp(!!wallet)
        dispatch(setIsAppLoading(false))
    }, [deviceToBackup?.rootAddress, dispatch, getWalletByRootAddress])

    useFocusEffect(
        useCallback(() => {
            getWallet()
        }, [getWallet]),
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

    const goToChoosePasswordScreen = useCallback(() => {
        if (deviceToBackup) {
            navigaiton.navigate(Routes.CHOOSE_MNEMONIC_BACKUP_PASSWORD, {
                mnemonicArray,
                device: deviceToBackup,
            })
        }
    }, [deviceToBackup, mnemonicArray, navigaiton])

    return (
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
                    disabled={isWalletBackedUp || isAppLoading}
                    style={[styles.cloudRowContent]}
                    action={goToChoosePasswordScreen}>
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
                    {isAppLoading ? (
                        <Lottie source={theme.isDark ? LoaderDark : LoaderLight} autoPlay loop style={styles.lottie} />
                    ) : (
                        !isWalletBackedUp && (
                            <BaseIcon name="chevron-right" size={14} color={theme.colors.textReversed} />
                        )
                    )}
                </BaseTouchableBox>
            </CardWithHeader>
        </BaseView>
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
