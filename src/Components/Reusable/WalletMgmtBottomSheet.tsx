import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseTouchableBox,
} from "~Components"
import { useI18nContext } from "~i18n"
import { Device } from "~Model"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { useScrollableList, info } from "~Common"

type Props = {
    devices: Device[]
    onClose: (device: Device) => void
}

export const WalletMgmtBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ devices, onClose }, ref) => {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["30%", "90%"], [])

    const [snapIndex, setSnapIndex] = useState<number>(0)

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(devices, snapIndex, snapPoints.length)

    const handleSheetChanges = useCallback((index: number) => {
        info("walletManagementSheet position changed", index)
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
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item }) => {
                            return (
                                <BaseTouchableBox
                                    action={onDeviceSelected(item)}
                                    justifyContent="space-between">
                                    <BaseText typographyFont="subTitleBold">
                                        {item.alias}
                                    </BaseText>
                                </BaseTouchableBox>
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
