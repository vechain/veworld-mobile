import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    BaseBottomSheet,
    BaseFlashList,
} from "~Components"
import { useI18nContext } from "~i18n"
import { BaseDevice } from "~Model"
import { StyleSheet } from "react-native"
import { useScrollableList } from "~Hooks"
import { DeviceBox } from "../DeviceBox"

// Redecalare forwardRef in order to support additional generics
declare module "react" {
    function forwardRef<T, P = {}>(
        render: (props: P, ref: React.Ref<T>) => React.ReactElement | null,
    ): (props: P & React.RefAttributes<T>) => React.ReactElement | null
}

type Props<T extends BaseDevice = BaseDevice> = {
    devices: T[]
    onClose: (device: T) => void
}

function SelectDeviceBottomSheetInner<T extends BaseDevice = BaseDevice>(
    { devices, onClose }: Props<T>,
    ref: React.Ref<BottomSheetModalMethods>,
) {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["50%", "90%"], [])

    const [snapIndex, setSnapIndex] = useState<number>(0)

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(devices, snapIndex, snapPoints.length)

    const handleSheetChanges = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const onDeviceSelected = useCallback(
        (device: BaseDevice) => () => {
            onClose(device as T)
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
                    <BaseFlashList
                        data={devices}
                        keyExtractor={device => device.rootAddress}
                        ItemSeparatorComponent={accountsListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item }) => {
                            return (
                                <DeviceBox
                                    device={item}
                                    onDeviceSelected={onDeviceSelected}
                                    isIconVisible={false}
                                />
                            )
                        }}
                        scrollEnabled={isListScrollable}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        estimatedItemSize={48}
                    />
                )}
            </BaseView>
        </BaseBottomSheet>
    )
}

const baseStyles = StyleSheet.create({
    list: {
        height: "78%",
    },
})

export const SelectDeviceBottomSheet = React.forwardRef(
    SelectDeviceBottomSheetInner,
)
