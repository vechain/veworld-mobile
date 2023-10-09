import React, { memo } from "react"
import { BaseCard, BaseImage, BaseText, BaseView } from "~Components"
import { StyleProp, StyleSheet } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import { WalletConnectSession } from "~Storage/Redux"

type Props = {
    session: WalletConnectSession
}

export const ConnectedAppBox: React.FC<Props> = memo(({ session }: Props) => {
    return (
        <BaseCard style={styles.container}>
            <BaseView
                w={100}
                flexDirection="row"
                style={styles.innerContainer}
                justifyContent="space-between">
                <BaseView flexDirection="row">
                    <BaseView flexDirection="column" alignItems="center">
                        <BaseImage
                            uri={session.dAppMetadata.icons[0] ?? ""}
                            style={styles.image as StyleProp<ImageStyle>}
                        />
                    </BaseView>

                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView pl={12}>
                            <BaseView
                                flexDirection="row"
                                alignItems="center"
                                justifyContent="flex-start">
                                <BaseText
                                    typographyFont="subSubTitle"
                                    fontSize={14}>
                                    {session.dAppMetadata.name}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                    </BaseView>
                </BaseView>
            </BaseView>
        </BaseCard>
    )
})

const styles = StyleSheet.create({
    innerContainer: {
        height: 45,
    },
    container: {
        width: "100%",
    },
    image: { width: 35, height: 35, borderRadius: 24 },
})
