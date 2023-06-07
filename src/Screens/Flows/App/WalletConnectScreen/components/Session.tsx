import { SessionTypes } from "@walletconnect/types"
import React, { memo, useCallback } from "react"
import {
    BaseSpacer,
    BaseText,
    BaseView,
    useWalletConnect,
    BaseButton,
} from "~Components"

type Props = {
    item: SessionTypes.Struct
}

export const Session: React.FC<Props> = memo(({ item }) => {
    const { disconnect } = useWalletConnect()

    const disconnectSession = useCallback(() => {
        disconnect(item.topic)
    }, [item.topic, disconnect])

    return (
        <>
            <BaseSpacer height={16} />
            <BaseText>
                {"Session Topic: "} {item.topic}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseText>
                {"DApp: "} {item.peer?.metadata?.name}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseText>
                {"DApp URL: "} {item.peer?.metadata?.url}
            </BaseText>
            <BaseSpacer height={24} />
            <BaseView alignItems="center" justifyContent="center">
                <BaseButton action={disconnectSession} title="Disconnect" />
            </BaseView>
        </>
    )
})
