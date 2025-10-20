import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { StyleSheet, Text } from "react-native"
import { BaseButton, BaseIcon, BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { useTabBarBottomMargin, useThemedStyles, useVns } from "~Hooks"
import { RootStackParamListHome, RootStackParamListSettings, Routes } from "~Navigation"
import FontUtils from "~Utils/FontUtils"

import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListHome | RootStackParamListSettings, Routes.USERNAME_CLAIMED>

export const UsernameClaimed: React.FC<Props> = ({ route, navigation }) => {
    const { username } = route.params
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyle)
    const { resetVns } = useVns()
    const { androidOnlyTabBarBottomMargin } = useTabBarBottomMargin()

    const onPress = useCallback(async () => {
        resetVns()
        navigation.goBack()
    }, [navigation, resetVns])

    return (
        <BaseSafeArea>
            <BaseView flexGrow={1} p={24} justifyContent="space-between">
                <BaseView flexGrow={1} alignItems="center" justifyContent="center">
                    <BaseIcon name="icon-check-circle" size={64} color={theme.colors.text} />

                    <BaseSpacer height={24} />

                    <BaseText typographyFont="subSubTitleMedium">{LL.TITLE_USERNAME_CLAIMED()}</BaseText>

                    <BaseSpacer height={8} />

                    <BaseText typographyFont="body" align="center" w={80}>
                        <Text style={styles.inlineBold}>{username} </Text>
                        {LL.SB_USERNAME_CLAIMED()}
                    </BaseText>
                </BaseView>
                <BaseView pb={androidOnlyTabBarBottomMargin} flexDirection="row">
                    <BaseButton w={100} action={onPress} selfAlign="flex-end" testID="UsernameClaimed_Btn">
                        {LL.BTN_CONTINUE()}
                    </BaseButton>
                </BaseView>
            </BaseView>
        </BaseSafeArea>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        inlineBold: {
            fontFamily: "Inter-Bold",
            fontSize: FontUtils.font(14),
            fontWeight: "600",
        },
    })
