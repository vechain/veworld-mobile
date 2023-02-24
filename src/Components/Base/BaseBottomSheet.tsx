import React from "react"
import { View, StyleSheet } from "react-native"
import { BottomSheetModal, BottomSheetProps } from "@gorhom/bottom-sheet"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

type Props = BottomSheetProps & {
    children: React.ReactNode
}

const BaseBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ children, ...props }, ref) => {
        return (
            <BottomSheetModal
                ref={ref}
                enablePanDownToClose={true}
                index={0}
                backgroundStyle={[styles.backgroundStyle, styles.shadowProp]}
                {...props}>
                <View style={styles.contentContainer}>{children}</View>
            </BottomSheetModal>
        )
    },
)

const styles = StyleSheet.create({
    backgroundStyle: {
        backgroundColor: "#FAFAFA",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    shadowProp: {
        shadowColor: "#171717",
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    contentContainer: {
        flex: 1,
        width: "100%",
        padding: 24,
        alignItems: "center",
    },
})

export default BaseBottomSheet
