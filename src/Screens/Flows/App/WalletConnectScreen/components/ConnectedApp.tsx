import { SessionTypes } from "@walletconnect/types"
import React, { memo } from "react"
import {
    BaseText,
    BaseView,
    BaseIcon,
    BaseImage,
    BaseTouchableBox,
} from "~Components"
import { StyleProp, StyleSheet } from "react-native"
import { useTheme, useThemedStyles } from "~Common"
import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"
import { AccountWithDevice } from "~Model"
import { ImageStyle } from "react-native-fast-image"

type Props = {
    session: SessionTypes.Struct
    account: AccountWithDevice
}

export const ConnectedApp: React.FC<Props> = memo(
    ({ session, account }: Props) => {
        const { styles } = useThemedStyles(baseStyles)
        const theme = useTheme()
        const nav = useNavigation()

        const onPress = () => {
            nav.navigate(Routes.SETTINGS_CONNECTED_APP_DETAILS, {
                session,
                account,
            })
        }

        return (
            <>
                <BaseTouchableBox
                    action={onPress}
                    innerContainerStyle={styles.container}>
                    <BaseView
                        w={100}
                        flexDirection="row"
                        style={styles.innerContainer}
                        justifyContent="space-between">
                        <BaseView flexDirection="row">
                            <BaseView
                                flexDirection="column"
                                alignItems="center">
                                <BaseImage
                                    uri={session.peer.metadata.icons[0]}
                                    style={
                                        styles.image as StyleProp<ImageStyle>
                                    }
                                />
                            </BaseView>
                            <BaseView
                                flexDirection="column"
                                alignItems="center">
                                <BaseView pl={12}>
                                    <BaseView
                                        flexDirection="row"
                                        alignItems="center"
                                        justifyContent="flex-start">
                                        <BaseText
                                            typographyFont="button"
                                            pb={5}>
                                            {session.peer?.metadata?.name}
                                        </BaseText>
                                    </BaseView>
                                    <BaseText typographyFont="smallButtonPrimary">
                                        {session.peer?.metadata?.url}
                                    </BaseText>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                        <BaseView
                            flexDirection="column"
                            alignItems="center"
                            pl={5}>
                            <BaseIcon
                                size={24}
                                name="chevron-right"
                                color={theme.colors.text}
                            />
                        </BaseView>
                    </BaseView>
                </BaseTouchableBox>
            </>
        )
    },
)

const baseStyles = () =>
    StyleSheet.create({
        innerContainer: {
            height: 45,
        },
        container: {
            width: "100%",
        },
        image: { width: 40, height: 40, borderRadius: 24 },
    })
