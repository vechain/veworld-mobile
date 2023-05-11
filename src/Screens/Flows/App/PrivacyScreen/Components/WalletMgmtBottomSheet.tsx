import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseView, BaseBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseDevice } from "~Model"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { DeviceBox } from "../../WalletManagementScreen/components"
import { useScrollableList, info } from "~Common"

type Props<T extends BaseDevice = BaseDevice> = {
    devices: T[]
    onClose: (device: T) => void
}

interface WithForwardRefType extends React.FC<Props<BaseDevice>> {
    <T extends BaseDevice>(props: Props<T>): ReturnType<React.FC<Props<T>>>
}

export const WalletMgmtBottomSheet: WithForwardRefType = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ devices, onClose }, ref: React.Ref<BottomSheetModalMethods>) => {
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
        (device: BaseDevice) => () => {
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
