import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useState } from "react"
import { StyleSheet } from "react-native"
import {
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { DelegationType } from "~Model/Delegation"
import { selectDelegationUrls, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { AddUrl } from "./Components"
import { useTheme } from "~Common"
const snapPoints = ["40%"]

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationOption: (id: DelegationType) => void
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (string?: string) => void
}

// component to select an account for delegation
export const SelectUrlBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ setSelectedDelegationUrl }, ref) => {
    const { LL } = useI18nContext()
    const [addUrlMode, setAddUrlMode] = useState(false)
    const [newUrl, setNewUrl] = useState("")
    const delegationUrls = useAppSelector(selectDelegationUrls)

    const onDismiss = () => {}

    const theme = useTheme()

    const handleAddUrlMode = () => {
        setAddUrlMode(true)
    }

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onDismiss={onDismiss}>
            {delegationUrls.length === 0 || addUrlMode ? (
                <AddUrl
                    setSelectedDelegationUrl={setSelectedDelegationUrl}
                    newUrl={newUrl}
                    setNewUrl={setNewUrl}
                />
            ) : (
                <BaseView>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        w={100}>
                        <BaseText typographyFont="subTitleBold">
                            {LL.SEND_DELEGATION_SELECT_URL()}
                        </BaseText>
                        <BaseIcon
                            name={"plus"}
                            bg={theme.colors.secondary}
                            action={handleAddUrlMode}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseView flexDirection="row" style={styles.list} />
                </BaseView>
            )}
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    list: {
        height: "78%",
    },
})
