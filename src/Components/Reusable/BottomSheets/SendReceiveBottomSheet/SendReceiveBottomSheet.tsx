import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { forwardRef, RefObject, useMemo, useState } from "react"
import { StyleSheet, TouchableOpacity } from "react-native"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { BaseTabs } from "~Components/Base/BaseTabs"
import { COLORS } from "~Constants"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { ReceiveTab } from "./ReceiveTab"
import { ScanTab } from "./ScanTab"

const TABS = ["scan", "receive"] as const

export const SendReceiveBottomSheet = forwardRef<BottomSheetModalMethods, {}>(function SendReceiveBottomSheet(
    props,
    ref,
) {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const [tab, setTab] = useState<(typeof TABS)[number]>("receive")
    const { onClose } = useBottomSheetModal({ externalRef: ref as RefObject<BottomSheetModalMethods> })

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
            {tab === "receive" ? <ReceiveTab /> : <ScanTab />}
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
