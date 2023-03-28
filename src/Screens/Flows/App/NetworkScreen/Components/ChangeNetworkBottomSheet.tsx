import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Common"
import { useAppDispatch } from "~Storage/Redux"
import { changeSelectedNetwork } from "~Storage/Redux/Actions"
import { Network } from "~Model"

type Props = {
    networks: Network[]
    onClose: () => void
}

const snapPoints = ["35%"]

export const ChangeNetworkBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ networks, onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const onPress = useCallback(
        (network: Network) => {
            dispatch(changeSelectedNetwork(network))
            onClose()
        },
        [onClose, dispatch],
    )

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView flexDirection="row" w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.BD_SELECT_NETWORK()}
                </BaseText>
            </BaseView>

            <BaseSpacer height={16} />

            {networks.map(network => (
                <BaseView my={10} w={100} key={network.type}>
                    <BaseTouchableBox action={() => onPress(network)}>
                        <BaseText>
                            {StringUtils.capitalize(network.type)}
                        </BaseText>
                    </BaseTouchableBox>
                </BaseView>
            ))}
        </BaseBottomSheet>
    )
})
