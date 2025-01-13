import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme, useVns } from "~Hooks"
import { RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListSettings, Routes.USERNAME_CLAIMED>

export const UsernameClaimed: React.FC<Props> = ({ route, navigation }) => {
    const { username } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()
    const { refetchVns } = useVns()

    const onPress = useCallback(async () => {
        refetchVns()
        navigation.goBack()
    }, [navigation, refetchVns])

    return (
        <BaseSafeArea>
            <BaseView flexGrow={1} p={24} pb={12}>
                <BaseView flexGrow={1} alignItems="center" justifyContent="center">
                    <BaseIcon name="icon-check-circle" size={64} color={theme.colors.text} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleMedium">{LL.TITLE_USERNAME_CLAIMED()}</BaseText>

                    <BaseSpacer height={8} />

                    <BaseText typographyFont="bodySemiBold" align="center">
                        {username}
                        <BaseText typographyFont="body">{LL.SB_USERNAME_CLAIMED()}</BaseText>
                    </BaseText>
                </BaseView>
                <BaseView mb={12} flexDirection="row">
                    <BaseButton w={100} action={onPress} selfAlign="flex-end" testID="UsernameClaimed_Btn">
                        {LL.BTN_CONTINUE()}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}
