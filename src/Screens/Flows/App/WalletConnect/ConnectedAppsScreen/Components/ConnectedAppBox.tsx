import React, { memo, useMemo } from "react"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { StyleProp, StyleSheet } from "react-native"
import FastImage, { ImageStyle } from "react-native-fast-image"
import type { ConnectedApp } from "~Screens"

type Props = {
    connectedApp: ConnectedApp
}

export const ConnectedAppBox: React.FC<Props> = memo(({ connectedApp }: Props) => {
    const name = useMemo(() => {
        if (connectedApp.type === "in-app") {
            return connectedApp.app.name
        } else return connectedApp.session.peer.metadata.name
    }, [connectedApp])

    const icon = useMemo(() => {
        if (connectedApp.type === "in-app") {
            return connectedApp.image
        } else
            return {
                uri: connectedApp.session.peer.metadata.icons[0],
            }
    }, [connectedApp])

    return (
        <BaseCard style={styles.container}>
            <BaseView w={100} flexDirection="row" style={styles.innerContainer} justifyContent="space-between">
                <BaseView flexDirection="row">
                    {icon ? (
                        <BaseView flexDirection="column" alignItems="center">
                            <FastImage source={icon} style={styles.image as StyleProp<ImageStyle>} />
                        </BaseView>
                    ) : (
                        <BaseSpacer width={35} />
                    )}

                    <BaseView flexDirection="column" alignItems="center">
                        <BaseView pl={12}>
                            <BaseView flexDirection="row" alignItems="center" justifyContent="flex-start">
                                <BaseText typographyFont="subSubTitle" fontSize={14}>
                                    {name}
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
