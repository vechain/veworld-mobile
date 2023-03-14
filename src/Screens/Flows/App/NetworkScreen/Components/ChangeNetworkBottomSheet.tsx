import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { Network, UserPreferences, useRealm } from "~Storage"
import { useI18nContext } from "~i18n"
import { StringUtils } from "~Common"

type Props = {
    networks: Realm.Results<Network & Realm.Object<unknown, never>>
    onClose: () => void
}

const snapPoints = ["35%"]

export const ChangeNetworkBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ networks, onClose }, ref) => {
    const { LL } = useI18nContext()

    const { store } = useRealm()
    const userPref = store.objectForPrimaryKey<UserPreferences>(
        UserPreferences.getName(),
        UserPreferences.getPrimaryKey(),
    )

    const onPress = useCallback(
        (currentNetwork: Network) => {
            store.write(() => (userPref!.currentNetwork = currentNetwork))
            onClose()
        },
        [onClose, store, userPref],
    )

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                orientation="row"
                justify="space-between"
                w={100}
                align="center">
                <BaseText typographyFont="subTitle">
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
