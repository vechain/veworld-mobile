import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import picasso from "@vechain/picasso"
import React, { forwardRef, RefObject, useCallback, useMemo, useState } from "react"
import { Share, StyleSheet, TouchableOpacity } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { BaseBottomSheet, BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useCopyClipboard, useThemedStyles, useVns } from "~Hooks"
import { useI18nContext } from "~i18n"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { OnlyVechainNetworkAlert } from "./OnlyVechainNetworkAlert"

const TABS = ["scan", "receive"] as const

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, {}>(function SendReceiveBottomSheet(
    props,
    ref,
) {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [tab, setTab] = useState<(typeof TABS)[number]>("receive")
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })

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

    const labels = useMemo(() => {
        return [LL.SEND_RECEIVE_TAB_SCAN(), LL.SEND_RECEIVE_TAB_RECEIVE()]
    }, [LL])

    return (
        <BaseBottomSheet
            snapPoints={["100%"]}
            noMargins
            ref={ref}
            backgroundStyle={styles.rootBg}
            enablePanDownToClose={false}
            rounded={false}>
            <BaseView py={24} px={16} justifyContent="center" flexDirection="row" position="relative">
                <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.WHITE}>
                    {LL.QR_CODE_TITLE()}
                </BaseText>
                <BaseView style={styles.closeIconContainer}>
                    <TouchableOpacity style={[styles.iconContainer]} onPress={onClose}>
                        <BaseIcon name="icon-x" color={COLORS.WHITE} size={20} />
                    </TouchableOpacity>
                </BaseView>
            </BaseView>
            <BaseText typographyFont="captionMedium" color={COLORS.WHITE} align="center">
                {LL.QR_CODE_DESCRIPTION()}
            </BaseText>
            <BaseView flex={1} justifyContent="center" px={24}>
                <BaseView
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius={16}
                    pt={32}
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
                            logoSize={56}
                            logoBackgroundColor="transparent"
                            logoSVG={picasso(selectedAccount.address.toLowerCase())}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseView flexDirection="column" gap={8}>
                        <BaseText typographyFont="subSubTitleSemiBold" color={COLORS.WHITE} align="center">
                            {vnsName || selectedAccount.alias}
                        </BaseText>
                        <BaseText typographyFont="captionSemiBold" color={COLORS.WHITE} align="center">
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
                            textColor={COLORS.WHITE}>
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
                            textColor={COLORS.WHITE}>
                            {accountCopied ? LL.COPIED_QR_CODE_FOR_ACCOUNT() : LL.COPY()}
                        </BaseButton>
                    </BaseView>
                    <BaseSpacer height={24} />
                    <OnlyVechainNetworkAlert />
                </BaseView>
            </BaseView>
            <BaseTabs
                keys={TABS}
                selectedKey={tab}
                setSelectedKey={setTab}
                labels={labels}
                rootStyle={styles.tabElement}
                indicatorBackgroundColor="rgba(255, 255, 255, 0.15)"
                containerBackgroundColor="rgba(0, 0, 0, 0.30)"
            />
            <BaseSpacer height={64} />
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
