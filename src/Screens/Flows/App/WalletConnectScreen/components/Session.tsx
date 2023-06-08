import { SessionTypes } from "@walletconnect/types"
import React, { memo } from "react"
import {
    BaseText,
    BaseView,
    BaseTouchable,
    BaseIcon,
    BaseImage,
} from "~Components"
import { StyleSheet } from "react-native"
import { useTheme, useThemedStyles } from "~Common"

type Props = {
    item: SessionTypes.Struct
}

export const Session: React.FC<Props> = memo(({ item }) => {
    const { styles } = useThemedStyles(baseStyles)
    const theme = useTheme()

    return (
        <>
            <BaseTouchable
                // action={() => onPress(activity)}
                style={styles.container}>
                <BaseView
                    w={100}
                    flexDirection="row"
                    style={styles.innerContainer}
                    justifyContent="space-between">
                    <BaseView flexDirection="row">
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseImage
                                uri={item.peer.metadata.icons[0]}
                                style={styles.image}
                            />
                        </BaseView>
                        <BaseView flexDirection="column" alignItems="center">
                            <BaseView pl={12}>
                                <BaseView
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="flex-start">
                                    <BaseText typographyFont="button" pb={5}>
                                        {item.peer?.metadata?.name}
                                    </BaseText>
                                </BaseView>
                                <BaseText typographyFont="smallButtonPrimary">
                                    {item.peer?.metadata?.url}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                    <BaseView flexDirection="column" alignItems="center" pl={5}>
                        <BaseIcon
                            size={24}
                            name="chevron-right"
                            color={theme.colors.text}
                        />
                    </BaseView>
                </BaseView>
            </BaseTouchable>
        </>
    )
})

const baseStyles = () =>
    StyleSheet.create({
        innerContainer: {
            height: 65,
        },
        container: {
            width: "100%",
        },
        image: { width: 40, height: 40, marginLeft: 5, borderRadius: 24 },
    })
