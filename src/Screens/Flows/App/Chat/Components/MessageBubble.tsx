import { DecodedMessage } from "@xmtp/react-native-sdk"
import React, { useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseView, BaseText, useVeChat } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"

type Props = {
    item: DecodedMessage
    index: number
    recipient: string
    children: React.ReactNode
}

const MessageBubble: React.FC<Props> = ({ item, index, children }) => {
    const { selectedClient } = useVeChat()
    const isSender = item.senderAddress === selectedClient?.inboxId
    const isLastItem = index === 0

    const { styles } = useThemedStyles(baseStyles(isSender))

    const humanDate = useCallback((timestamp: number) => {
        const date = new Date(timestamp)
        const hours = date.getHours()
        const mins = date.getMinutes().toLocaleString("en", { notation: "standard" })
        return `${hours}:${mins}`
    }, [])

    return (
        <BaseView>
            <BaseView flexDirection="row" w={100} px={12} mb={isLastItem ? 6 : 0} style={[styles.messageContainer]}>
                <BaseView
                    p={12}
                    style={[styles.messageBubble, isSender ? styles.sendedMessage : styles.receivedMessage]}>
                    {/* Enable it if you want to show the address */}
                    {/* <BaseText typographyFont="captionBold" style={[styles.textColor]}>
                    {!isSender ? humanAddress(recipient) : humanAddress(selectedClient.address)}
                </BaseText> */}
                    <BaseText style={[styles.textColor]}>{children} </BaseText>
                    <BaseView flexDirection="row" justifyContent="flex-end">
                        <BaseText typographyFont="smallCaption" style={[styles.textColor]}>
                            {humanDate(item.sentNs / 1000000)}
                        </BaseText>
                    </BaseView>
                </BaseView>
                {/* Renders arrows */}
                {isSender ? (
                    <>
                        <BaseView style={styles.rightArrow} />
                        <BaseView style={styles.rightArrowOverlap} />
                    </>
                ) : (
                    <>
                        <BaseView style={styles.leftArrow} />
                        <BaseView style={styles.leftArrowOverlap} />
                    </>
                )}
            </BaseView>
            {isSender && <BaseText align="right">{item.deliveryStatus}</BaseText>}
        </BaseView>
    )
}

const baseStyles = (isSender: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        messageContainer: {
            justifyContent: isSender ? "flex-end" : "flex-start",
            paddingHorizontal: 1,
        },
        messageBubble: {
            borderRadius: 18,
            maxWidth: "50%",
        },
        sendedMessage: {
            marginRight: 16,
            backgroundColor: theme.colors.primary,
        },
        receivedMessage: {
            marginLeft: 16,
            backgroundColor: theme.isDark ? theme.colors.card : theme.colors.cardBorder,
        },
        textColor: {
            color: !isSender ? theme.colors.text : theme.colors.textReversed,
        },
        /*Arrow for sended messages */
        rightArrow: {
            position: "absolute",
            backgroundColor: theme.colors.primary,
            width: 18,
            height: 25,
            bottom: 0,
            borderBottomLeftRadius: 25,
            right: 10,
        },

        rightArrowOverlap: {
            position: "absolute",
            backgroundColor: theme.colors.background,
            width: 20,
            height: 35,
            bottom: -6,
            borderBottomLeftRadius: 18,
            right: -3,
        },

        /*Arrow head for recevied messages*/
        leftArrow: {
            position: "absolute",
            backgroundColor: theme.isDark ? theme.colors.card : theme.colors.cardBorder,
            width: 18,
            height: 25,
            bottom: 0,
            borderBottomRightRadius: 25,
            left: 10,
        },

        leftArrowOverlap: {
            position: "absolute",
            backgroundColor: theme.colors.background,
            width: 20,
            height: 35,
            bottom: -6,
            borderBottomRightRadius: 18,
            left: -3,
        },
    })

export default MessageBubble
