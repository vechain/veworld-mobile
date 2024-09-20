import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import moment from "moment"
import React, { useEffect } from "react"
import { StyleSheet } from "react-native"
import { SecurityAlertDarkSVG, SecurityAlertLightSVG } from "~Assets"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseText, BaseView } from "~Components"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DEVICE_TYPE } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import {
    selectLastBackupRequestTimestamp,
    selectSelectedAccount,
    setLastBackupRequestTimestamp,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

export const DeviceBackupModal = () => {
    const dispatch = useAppDispatch()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()
    const naigation = useNavigation<NativeStackNavigationProp<RootStackParamListHome>>()

    const lastBackupRequestTimestamp = useAppSelector(selectLastBackupRequestTimestamp)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const isBackupNeeded =
        !selectedAccount.device?.isBuckedUp && selectedAccount.device?.type === DEVICE_TYPE.LOCAL_MNEMONIC

    useEffect(() => {
        const address = selectedAccount.device?.rootAddress ?? ""

        if (!isBackupNeeded) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address,
                    timestamp: undefined,
                }),
            )
            return
        }

        const now = moment()

        if (isBackupNeeded && !lastBackupRequestTimestamp) {
            dispatch(
                setLastBackupRequestTimestamp({
                    address: address,
                    timestamp: now.unix(),
                }),
            )
            onOpen()
            return
        }

        if (lastBackupRequestTimestamp) {
            const timeStamp = lastBackupRequestTimestamp[address]

            if (isBackupNeeded && !timeStamp) {
                dispatch(
                    setLastBackupRequestTimestamp({
                        address: address,
                        timestamp: now.unix(),
                    }),
                )
                onOpen()
                return
            }

            if (timeStamp) {
                const _lastBackupRequestTimestamp = moment.unix(timeStamp)
                const shouldOpen = now.diff(_lastBackupRequestTimestamp, "weeks") >= 1 && isBackupNeeded

                if (shouldOpen) {
                    dispatch(
                        setLastBackupRequestTimestamp({
                            address: address,
                            timestamp: now.unix(),
                        }),
                    )
                    onOpen()
                }
            }
        }
    }, [dispatch, isBackupNeeded, lastBackupRequestTimestamp, onClose, onOpen, selectedAccount.device?.rootAddress])

    const goToPrivacyScreen = () => {
        onClose()
        naigation.navigate(Routes.SETTINGS_PRIVACY)
    }

    return (
        <BaseBottomSheet style={styles.contentContainer} bottomSafeArea dynamicHeight ref={ref}>
            <BaseView style={styles.contentContainer}>
                {theme.isDark ? <SecurityAlertDarkSVG /> : <SecurityAlertLightSVG />}
                <BaseSpacer height={24} />
                <BaseText typographyFont="button">{LL.DEVICE_BACKUP_MODAL_TITLE()}</BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body">{LL.DEVICE_BACKUP_MODAL_SUBTITLE()}</BaseText>
                <BaseSpacer height={24} />
                <BaseButton
                    accessible
                    variant="solid"
                    size="lg"
                    haptics="Medium"
                    w={100}
                    title={"Backup now"}
                    action={goToPrivacyScreen}
                    activeOpacity={0.94}
                />
                <BaseSpacer height={16} />
                <BaseButton
                    accessible
                    variant="outline"
                    size="lg"
                    haptics="Medium"
                    w={100}
                    title={"I’ll do it later"}
                    action={onClose}
                    activeOpacity={0.94}
                />
            </BaseView>
            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
}

const baseStyles = () => {
    return StyleSheet.create({
        contentContainer: {
            alignItems: "center",
        },
    })
}
