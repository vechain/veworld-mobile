import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseView, BaseBottomSheet } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseDevice } from "~Model"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { useScrollableBottomSheet } from "~Hooks"
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

    const snapPoints = useMemo(() => ["30%", "90%"], [])

    const accountsListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const { flatListScrollProps } = useScrollableBottomSheet({
        data: devices,
        snapPoints,
    })

    const onDeviceSelected = useCallback(
        (device: T) => () => {
            onClose(device)
        },
        [onClose],
    )

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
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
                        {...flatListScrollProps}
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
