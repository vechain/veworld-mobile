import { SessionTypes } from "@walletconnect/types"
import React, { memo } from "react"
import {
    BaseText,
    BaseView,
    BaseImage,
    BaseTouchableBox,
    BaseSpacer,
} from "~Components"
import { StyleProp, StyleSheet } from "react-native"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { AccountWithDevice } from "~Model"
import { ImageStyle } from "react-native-fast-image"
import { AppDetailsBottomSheet } from "./AppDetailsBottomSheet"

type Props = {
    session: SessionTypes.Struct
    account: AccountWithDevice
}

export const ConnectedAppBox: React.FC<Props> = memo(
    ({ session, account }: Props) => {
        const { styles } = useThemedStyles(baseStyles)

        const onPress = () => {
            openConnectedAppDetailsSheet()
        }

        const {
            ref: connectedAppDetailsBottomSheetRef,
            onOpen: openConnectedAppDetailsSheet,
            onClose: closeConnectedAppDetailsSheet,
        } = useBottomSheetModal()

        //TODO: Implement "disconnect" functionality on long press

        return (
            <>
                <BaseSpacer height={16} />
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
                                        <BaseText typographyFont="subSubTitle">
                                            {session.peer?.metadata?.name}
                                        </BaseText>
                                    </BaseView>
                                </BaseView>
                            </BaseView>
                        </BaseView>
                    </BaseView>

                    <AppDetailsBottomSheet
                        ref={connectedAppDetailsBottomSheetRef}
                        onClose={closeConnectedAppDetailsSheet}
                        session={session}
                        account={account}
                    />
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
