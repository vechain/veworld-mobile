import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, useCallback, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { veworldLogo } from "~Assets"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useCopyClipboard, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, {}>(function SendReceiveBottomSheet(
    props,
    ref,
) {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { name: vnsName } = useVns({
        name: "",
        address: selectedAccount.address,
    })

    const [accountCopied, setAccountCopied] = useState(false)
    const [vnsCopied, setVnsCopied] = useState(false)

    const { onCopyToClipboard } = useCopyClipboard()

    const onCopyAccount = useCallback(async () => {
        onCopyToClipboard(selectedAccount.address, "", false)
        setAccountCopied(true)
        setTimeout(() => {
            setAccountCopied(false)
        }, 3000)
    }, [onCopyToClipboard, selectedAccount.address])

    const onCopyVns = useCallback(async () => {
        onCopyToClipboard(vnsName, "", false)
        setVnsCopied(true)
        setTimeout(() => {
            setVnsCopied(false)
        }, 3000)
    }, [onCopyToClipboard, vnsName])

    return (
        <BaseBottomSheet snapPoints={["100%"]} noMargins ref={ref} backgroundStyle={styles.rootBg}>
            <BaseView p={16} justifyContent="space-between" flexDirection="row">
                <TouchableOpacity style={styles.iconContainer}>
                    <BaseIcon name="icon-share-2" color={COLORS.WHITE} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconContainer}>
                    <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                </TouchableOpacity>
            </BaseView>
            <BaseView pt={48} pb={64} px={24} alignItems="center">
                <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.WHITE}>
                    {LL.QR_CODE_TITLE()}
                </BaseText>
                <BaseSpacer height={8} />
                <BaseText typographyFont="captionMedium" color={COLORS.WHITE}>
                    {LL.QR_CODE_DESCRIPTION()}
                </BaseText>
                <BaseSpacer height={40} />
                <BaseView
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius={16}
                    pt={40}
                    pb={24}
                    px={24}
                    w={100}
                    alignItems="center">
                    <BaseView
                        bg={COLORS.WHITE}
                        style={styles.qrCodeWrapper}
                        justifyContent="center"
                        alignItems="center">
                        <QRCode
                            ecl="H"
                            value={selectedAccount.address}
                            size={200}
                            quietZone={10}
                            logo={{ uri: veworldLogo }}
                            logoSize={56}
                            logoBackgroundColor="transparent"
                        />
                    </BaseView>
                    <BaseSpacer height={32} />
                    <BaseView flexDirection="row">
                        <BaseButton
                            flex={1}
                            px={12}
                            py={8}
                            rightIcon={<BaseIcon name="icon-copy" size={16} color={COLORS.WHITE} />}
                            numberOfLines={1}
                            textProps={{ ellipsizeMode: "middle", flexDirection: "row", flex: 1, align: "center" }}
                            action={onCopyAccount}
                            disabled={accountCopied}
                            variant="outline"
                            style={styles.btnStyle}
                            textColor={COLORS.WHITE}>
                            {accountCopied ? LL.COPIED_QR_CODE_FOR_ACCOUNT() : selectedAccount.address}
                        </BaseButton>
                        {vnsName && (
                            <BaseButton
                                flex={1}
                                px={12}
                                py={8}
                                rightIcon={<BaseIcon name="icon-copy" size={16} color={COLORS.WHITE} />}
                                numberOfLines={1}
                                textProps={{ ellipsizeMode: "tail" }}
                                action={onCopyVns}
                                disabled={vnsCopied}
                                textColor={COLORS.WHITE}>
                                {vnsCopied ? LL.COPIED_QR_CODE_FOR_ACCOUNT() : vnsName}
                            </BaseButton>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        rootBg: {
            backgroundColor: COLORS.BALANCE_BACKGROUND,
        },
        iconContainer: {
            padding: 10,
            backgroundColor: "rgba(0, 0, 0, 0.30)",
            borderRadius: 99,
        },
        qrCodeWrapper: {
            width: 200,
            height: 200,
            borderRadius: 21.44,
            overflow: "hidden",
        },
        btnStyle: {
            backgroundColor: "transparent",
            borderRadius: 8,
            borderColor: COLORS.WHITE_RGBA_30,
            gap: 12,
        },
    })
