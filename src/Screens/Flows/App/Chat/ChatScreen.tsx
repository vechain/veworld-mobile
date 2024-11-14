import React from "react"
import { BaseIcon, BaseText, BaseView, Layout } from "~Components"
import { useTheme } from "~Hooks"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AccountAddressButtonPill } from "../HomeScreen/Components/AccountCard/AccountAddressButtonPill"

export const ChatScreen: React.FC = () => {
    const theme = useTheme()
    const currentAccount = useAppSelector(selectSelectedAccount)

    return (
        <Layout
            noMargin
            noBackButton
            fixedHeader={
                <BaseView w={100} px={20} pb={8} flexDirection="row" alignItems="center" justifyContent="space-between">
                    <BaseView alignItems="flex-start" alignSelf="flex-start">
                        <BaseText typographyFont="largeTitle" testID="veworld-homepage">
                            {"Chat"}
                        </BaseText>
                    </BaseView>
                    <BaseView flexDirection="row">
                        <AccountAddressButtonPill
                            text={currentAccount.address}
                            openQRCodeSheet={() => {}}
                            switchAccount={() => {}}
                        />
                        <BaseIcon
                            name={"plus"}
                            size={24}
                            color={theme.colors.text}
                            mx={8}
                            action={() => {}}
                            haptics="Light"
                        />
                        <BaseIcon
                            name={"dots-vertical"}
                            size={24}
                            color={theme.colors.text}
                            action={() => {}}
                            haptics="Light"
                        />
                    </BaseView>
                </BaseView>
            }
            fixedBody={<></>}
        />
    )
}
