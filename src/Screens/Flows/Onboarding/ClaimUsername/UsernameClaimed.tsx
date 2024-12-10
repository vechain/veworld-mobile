import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { RootStackParamListOnboarding, Routes } from "~Navigation"
import { useHandleWalletCreation } from "../WelcomeScreen/useHandleWalletCreation"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListOnboarding, Routes.USERNAME_CLAIMED>

export const UsernameClaimed: React.FC<Props> = ({ route }) => {
    const { pin } = route.params || {}
    const { LL } = useI18nContext()
    const { migrateFromOnboarding } = useHandleWalletCreation()

    const onPress = useCallback(async () => {
        await migrateFromOnboarding(pin)
    }, [migrateFromOnboarding, pin])

    return (
        <BaseSafeArea>
            <BaseView flexGrow={1} p={24}>
                <BaseView flexGrow={1} alignItems="center" justifyContent="center">
                    <BaseIcon name="check-circle-outline" size={40} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleMedium">{LL.TITLE_USERNAME_CLAIMED()}</BaseText>

                    <BaseSpacer height={8} />

                    <BaseText typographyFont="body">{LL.SB_USERNAME_CLAIMED()}</BaseText>
                </BaseView>
                <BaseView mb={24} flexDirection="row">
                    <BaseButton w={100} action={() => onPress()} selfAlign="flex-end">
                        {LL.BTN_CONTINUE()}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}
