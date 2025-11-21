import React, { useCallback, useMemo } from "react"
import { Keyboard, StyleSheet } from "react-native"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { SendScreenV2 } from "~Screens/Flows/App/SendScreen/SendScreen_V2/SendScreen_V2"
import { BaseBottomSheet } from "~Components/Base"
import { ColorThemeType } from "~Constants"

export const useSendBottomSheet = () => {
    const { styles } = useThemedStyles(baseStyles)
    const { ref: sendSheetRef, onOpen: openSendSheet } = useBottomSheetModal<BottomSheetModalMethods>()

    const handleOpenSend = useCallback(() => {
        Keyboard.dismiss()
        openSendSheet()
    }, [openSendSheet])

    const RenderSendBottomSheet = useMemo(
        () => (
            <BaseBottomSheet
                ref={sendSheetRef}
                snapPoints={["100%"]}
                backgroundStyle={styles.rootBg}
                enablePanDownToClose={false}
                rounded={false}>
                {() => <SendScreenV2 />}
            </BaseBottomSheet>
        ),
        [sendSheetRef, styles.rootBg],
    )

    return { RenderSendBottomSheet, handleOpenSend }
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootBg: {
            backgroundColor: theme.colors.sendBottomSheet.background,
        },
    })
