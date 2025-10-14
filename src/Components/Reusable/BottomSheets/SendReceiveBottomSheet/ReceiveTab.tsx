import picasso from "@vechain/picasso"
import React, { useCallback, useState } from "react"
import { Share, StyleSheet } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useCopyClipboard } from "~Hooks/useCopyClipboard"
import { useVns } from "~Hooks/useVns"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { OnlyVechainNetworkAlert } from "./OnlyVechainNetworkAlert"

export const ReceiveTab = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { name: vnsName } = useVns({
        name: "",
        address: selectedAccount.address,
    })

    const [accountCopied, setAccountCopied] = useState(false)

    const { onCopyToClipboard } = useCopyClipboard()

    const onCopyAccount = useCallback(async () => {
        onCopyToClipboard(selectedAccount.address, "", false)
        setAccountCopied(true)
        setTimeout(() => {
            setAccountCopied(false)
        }, 3000)
    }, [onCopyToClipboard, selectedAccount.address])

    const onShare = useCallback(async () => {
        Share.share({
            message: selectedAccount.address,
        })
    }, [selectedAccount.address])
    return (
        <BaseView flex={1} justifyContent="center" px={24}>
            <BaseView
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius={16}
                pt={32}
                pb={24}
                px={24}
                w={100}
                alignItems="center">
                <BaseView bg={COLORS.WHITE} style={styles.qrCodeWrapper} justifyContent="center" alignItems="center">
                    <QRCode
                        ecl="H"
                        value={selectedAccount.address}
                        size={200}
                        quietZone={10}
                        logoSize={56}
                        logoBackgroundColor="transparent"
                        logoSVG={picasso(selectedAccount.address.toLowerCase())}
                    />
                </BaseView>
                <BaseSpacer height={16} />
                <BaseView flexDirection="column" gap={8}>
                    <BaseText
                        typographyFont="subSubTitleSemiBold"
                        color={COLORS.WHITE}
                        align="center"
                        testID="RECEIVE_TAB_ACCOUNT_ALIAS">
                        {vnsName || selectedAccount.alias}
                    </BaseText>
                    <BaseText
                        typographyFont="captionSemiBold"
                        color={COLORS.WHITE}
                        align="center"
                        testID="RECEIVE_TAB_ACCOUNT_ADDRESS">
                        {AddressUtils.humanAddress(selectedAccount.address)}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={24} />
                <BaseView flexDirection="row" gap={16}>
                    <BaseButton
                        flex={1}
                        px={12}
                        py={8}
                        rightIcon={<BaseIcon name="icon-upload" size={16} color={COLORS.WHITE} />}
                        action={onShare}
                        variant="outline"
                        style={styles.btnStyle}
                        textColor={COLORS.WHITE}
                        testID="RECEIVE_TAB_SHARE">
                        {LL.SHARE()}
                    </BaseButton>
                    <BaseButton
                        flex={1}
                        px={12}
                        py={8}
                        rightIcon={<BaseIcon name="icon-copy" size={16} color={COLORS.WHITE} />}
                        action={onCopyAccount}
                        disabled={accountCopied}
                        variant="outline"
                        style={styles.btnStyle}
                        textColor={COLORS.WHITE}
                        testID="RECEIVE_TAB_COPY">
                        {accountCopied ? LL.COPIED_QR_CODE_FOR_ACCOUNT() : LL.COPY()}
                    </BaseButton>
                </BaseView>
                <BaseSpacer height={24} />
                <OnlyVechainNetworkAlert />
            </BaseView>
        </BaseView>
    )
}

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
        closeIconContainer: {
            position: "absolute",
            top: 16,
            right: 16,
            flexDirection: "column",
            justifyContent: "center",
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
            alignItems: "center",
            justifyContent: "center",
        },
        tabElement: {
            marginHorizontal: 24,
            alignSelf: "center",
            maxWidth: "75%",
        },
    })
