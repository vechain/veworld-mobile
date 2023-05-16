import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { StyleSheet } from "react-native"
import { BaseBottomSheet, BaseSpacer, BaseText, BaseView } from "~Components"
import { AccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { useI18nContext } from "~i18n"
const snapPoints = ["40%"]

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationOption: (id: DelegationType) => void
    setSelectedAccount: (account?: AccountWithDevice) => void
    selectedAccount?: AccountWithDevice
}

// component to select an account for delegation
export const SelectUrlBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({}, ref) => {
    const { LL } = useI18nContext()

    const onDismiss = () => {}

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onDismiss={onDismiss}>
            <BaseText typographyFont="subTitleBold">
                {LL.SEND_DELEGATION_SELECT_ACCOUNT()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" style={styles.list} />
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        height: "78%",
    },
})
