import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet } from "~Components"
import { BaseSpacer, BaseText, BaseView } from "~Components"

import { useI18nContext } from "~i18n"
import { Device } from "~Model"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { DeviceBox } from "../../WalletManagementScreen/components"

type Props = {
    devices?: Device[]
    onClose: (device: Device) => void
}

export const WalletMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ devices, onClose }, ref) => {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["30%", "90%"], [])
    const [snapIndex, setSnapIndex] = useState<number>(0)

    // The list is scrollable when the bottom sheet is fully expanded
    const isListScrollable = useMemo(
        () => snapIndex === snapPoints.length - 1,
        [snapIndex, snapPoints],
    )

    const handleSheetChanges = useCallback((index: number) => {
        console.log("walletManagementSheet position changed", index)
        setSnapIndex(index)
    }, [])

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeviceSelected = useCallback(
        (device: Device) => () => {
            onClose(device)
        },
        [onClose],
    )

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.TITLE_EDIT_WALLET()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseView flexDirection="row" style={baseStyles.list}>
                {!!devices?.length && (
                    <BottomSheetFlatList
                        data={devices}
                        keyExtractor={device => device.rootAddress}
                        ItemSeparatorComponent={accountsListSeparator}
                        renderItem={({ item }) => {
                            return (
                                <DeviceBox
                                    device={item}
                                    onDeviceSelected={onDeviceSelected(item)}
                                    isIconVisible={false}
                                />
                            )
                        }}
                        scrollEnabled={isListScrollable}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    />
                )}
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    list: {
        height: "78%",
    },
})
