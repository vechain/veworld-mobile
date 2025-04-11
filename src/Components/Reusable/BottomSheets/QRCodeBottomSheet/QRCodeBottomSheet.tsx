import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { useCopyClipboard, useThemedStyles, useVns } from "~Hooks"

import { StyleSheet } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { veworldLogo } from "~Assets"
import { COLORS } from "~Constants"
import { useI18nContext } from "~i18n"
import { useAppSelector } from "~Storage/Redux"
import { selectSelectedAccount } from "~Storage/Redux/Selectors"
import { AddressUtils } from "~Utils"

export const QRCodeBottomSheet = React.forwardRef<BottomSheetModalMethods>(({}, ref) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { name: vnsName, address: vnsAddress } = useVns({
        name: "",
        address: selectedAccount.address,
    })

    const humanAddress = useMemo(() => AddressUtils.humanAddress(selectedAccount.address), [selectedAccount.address])
    const [address, setAddress] = useState(humanAddress)

    const { onCopyToClipboard } = useCopyClipboard()

    const nameOrAddress = useMemo(() => {
        return vnsName || AddressUtils.humanAddress(vnsAddress || selectedAccount.address)
    }, [selectedAccount.address, vnsAddress, vnsName])

    const [username, setUsername] = useState(nameOrAddress)

    const showAddressCheckIcon = address === LL.COPIED_QR_CODE_FOR_ACCOUNT()
    const showUsernameCheckIcon = username === LL.COPIED_QR_CODE_FOR_ACCOUNT()
    const showUsername = nameOrAddress.includes(".vet")

    const onCopyAddress = useCallback(
        (text: string, labelName: string) => {
            if (showAddressCheckIcon) return

            onCopyToClipboard(text, labelName, false)
            setAddress(LL.COPIED_QR_CODE_FOR_ACCOUNT())
            setTimeout(() => {
                setAddress(humanAddress)
            }, 1500)
        },
        [LL, humanAddress, onCopyToClipboard, showAddressCheckIcon],
    )

    const onCopyUsername = useCallback(
        (text: string, labelName: string) => {
            if (showUsernameCheckIcon) return

            onCopyToClipboard(text, labelName, false)
            setUsername(LL.COPIED_QR_CODE_FOR_ACCOUNT())
            setTimeout(() => {
                setUsername(nameOrAddress)
            }, 1500)
        },
        [LL, nameOrAddress, onCopyToClipboard, showUsernameCheckIcon],
    )

    useEffect(() => {
        setUsername(nameOrAddress)
        setAddress(humanAddress)
    }, [nameOrAddress, humanAddress])

    return (
        <BaseBottomSheet dynamicHeight ref={ref}>
            <BaseView flexDirection="row" w={100} justifyContent="center">
                <BaseText typographyFont="subTitleSemiBold">{LL.TITLE_QR_CODE_FOR_ACCOUNT()}</BaseText>
            </BaseView>
            <BaseSpacer height={8} />
            <BaseView flexDirection="row" w={100} justifyContent="center">
                <BaseText style={styles.description} typographyFont="subSubTitleLight">
                    {LL.DESCRIPTION_QR_CODE_FOR_ACCOUNT()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={40} />

            <BaseView justifyContent="center" alignItems="center">
                <BaseView bg={COLORS.WHITE} style={styles.qrCodeWrapper} justifyContent="center" alignItems="center">
                    <QRCode
                        ecl="H"
                        value={selectedAccount.address}
                        size={200}
                        quietZone={10}
                        logo={{ uri: veworldLogo }}
                        logoSize={52}
                        logoBackgroundColor="transparent"
                    />
                </BaseView>

                <BaseSpacer height={32} />

                <BaseButton
                    haptics="Light"
                    px={28}
                    size="md"
                    w={100}
                    style={styles.button}
                    title={address}
                    action={() => onCopyAddress(selectedAccount.address, LL.COMMON_LBL_ADDRESS())}
                    leftIcon={
                        showAddressCheckIcon ? (
                            <BaseIcon name="icon-check" color={theme.colors.card} style={styles.checkIcon} />
                        ) : null
                    }
                    rightIcon={
                        !showAddressCheckIcon ? (
                            <BaseIcon name="icon-copy" color={theme.colors.card} style={styles.icon} />
                        ) : null
                    }
                />

                {showUsername && (
                    <>
                        <BaseSpacer height={16} />
                        <BaseButton
                            haptics="Light"
                            px={28}
                            size="md"
                            w={100}
                            style={styles.button}
                            title={username}
                            action={() => onCopyUsername(nameOrAddress, LL.COMMON_LBL_ADDRESS())}
                            leftIcon={
                                showUsernameCheckIcon ? (
                                    <BaseIcon name="icon-check" color={theme.colors.card} style={styles.checkIcon} />
                                ) : null
                            }
                            rightIcon={
                                !showUsernameCheckIcon ? (
                                    <BaseIcon name="icon-copy" color={theme.colors.card} style={styles.icon} />
                                ) : null
                            }
                        />
                    </>
                )}
                <BaseSpacer height={40} />
                <BaseView flexDirection="row" w={100} px={20} justifyContent="center" alignItems="center">
                    <BaseIcon name="icon-info" size={20} color={theme.colors.text} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="body">{LL.NETWORK_WARNING_QR_CODE_FOR_ACCOUNT()}</BaseText>
                </BaseView>
                <BaseSpacer height={16} />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        qrCodeWrapper: {
            width: 200,
            height: 200,
            borderRadius: 21.44,
            overflow: "hidden",
        },
        icon: {
            marginLeft: 16,
        },
        checkIcon: {
            marginRight: 8,
        },
        button: {
            justifyContent: "center",
            alignItems: "center",
            height: 48,
        },
        description: {
            textAlign: "center",
        },
    })
