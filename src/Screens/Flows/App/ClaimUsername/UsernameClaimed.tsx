import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.USERNAME_CLAIMED>

export const UsernameClaimed: React.FC<Props> = ({ navigation }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const onPress = useCallback(async () => {
        navigation.navigate(Routes.HOME)
    }, [navigation])

    return (
        <BaseSafeArea>
            <BaseView flexGrow={1} p={24}>
                <BaseView flexGrow={1} alignItems="center" justifyContent="center">
                    <BaseIcon name="icon-check-circle" size={64} color={theme.colors.text} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleMedium">{LL.TITLE_USERNAME_CLAIMED()}</BaseText>

                    <BaseSpacer height={8} />

                    <BaseText typographyFont="body" align="center">
                        {LL.SB_USERNAME_CLAIMED()}
                    </BaseText>
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
