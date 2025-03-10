import React, { useCallback, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseIcon, BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useAnalyticTracking, useTheme, useThemedStyles } from "~Hooks"
import { AnalyticsEvent, ColorThemeType, DerivationPath } from "~Constants"
import { setDerivedPath, useAppDispatch } from "~Storage/Redux"
import { StyleSheet } from "react-native"

type Props = {
    onClose: (path: DerivationPath) => void
}

export const SelectDerivationPathBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(({ onClose }, ref) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const [derivationPath, setDerivationPath] = useState<DerivationPath>(DerivationPath.VET)
    const { styles } = useThemedStyles(baseStyles)

    const handleSelectedDerivationPath = useCallback(
        (path: DerivationPath) => {
            setDerivationPath(path)
            track(AnalyticsEvent.WALLET_ADD_DERIVATION_PATH_TYPE, { path })
            dispatch(setDerivedPath(path))

            setTimeout(() => {
                onClose(path)
            }, 200)
        },
        [track, dispatch, onClose],
    )

    return (
        <BaseBottomSheet dynamicHeight ref={ref}>
            <BaseView flexDirection="column" w={100}>
                <BaseText typographyFont="subTitleBold">{LL.BTN_CREATE_WALLET_ADVANCED_SETUP()}</BaseText>
                <BaseSpacer height={16} />
                <BaseText typographyFont="body">{LL.BTN_SELECT_DERIVATION_PATH()}</BaseText>
            </BaseView>

            <BaseSpacer height={24} />

            <BaseTouchableBox
                action={() => handleSelectedDerivationPath(DerivationPath.VET)}
                py={16}
                haptics="Medium"
                containerStyle={derivationPath === DerivationPath.VET ? styles.selectedStyle : {}}>
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle" pb={4}>
                        {LL.BTN_SELECT_DERIVATION_PATH_VET()}
                    </BaseText>

                    <BaseText pt={4} align="left" typographyFont="captionRegular">
                        {DerivationPath.VET}
                    </BaseText>
                </BaseView>
                {derivationPath === DerivationPath.VET && (
                    <BaseIcon name="icon-check" size={24} color={theme.colors.text} />
                )}
            </BaseTouchableBox>

            <BaseSpacer height={16} />

            <BaseTouchableBox
                action={() => handleSelectedDerivationPath(DerivationPath.ETH)}
                py={16}
                haptics="Medium"
                containerStyle={derivationPath === DerivationPath.ETH ? styles.selectedStyle : {}}>
                <BaseView flex={1} px={12}>
                    <BaseText align="left" typographyFont="subSubTitle" pb={4}>
                        {LL.BTN_SELECT_DERIVATION_PATH_ETH()}
                    </BaseText>
                    <BaseText pt={4} align="left" typographyFont="captionRegular">
                        {DerivationPath.ETH}
                    </BaseText>
                </BaseView>
                {derivationPath === DerivationPath.ETH && (
                    <BaseIcon name="icon-check" size={24} color={theme.colors.text} />
                )}
            </BaseTouchableBox>
            <BaseSpacer height={16} />
        </BaseBottomSheet>
    )
})

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        selectedStyle: {
            borderWidth: 1,
            borderBottomColor: theme.colors.border,
        },
    })
