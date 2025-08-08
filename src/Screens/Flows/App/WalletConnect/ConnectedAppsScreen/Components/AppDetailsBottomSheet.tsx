import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { default as React, useCallback, useMemo } from "react"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { ConnectedApp } from "~Screens"
import { DAppUtils } from "~Utils"
import { AppInfo } from "../../Components"

type Props = {
    onClose: () => void
    connectedApp: ConnectedApp
    onDisconnect: () => void
}

export const AppDetailsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, connectedApp, onDisconnect }, ref) => {
        const { LL } = useI18nContext()

        const icon = useMemo(() => {
            if (connectedApp.type === "in-app") {
                if (connectedApp.app.id) return { uri: DAppUtils.getAppHubIconUrl(connectedApp.app.id) }
                return { uri: DAppUtils.generateFaviconUrl(connectedApp.app.href) }
            } else
                return {
                    uri: connectedApp.session.peer.metadata.icons[0],
                }
        }, [connectedApp])

        const { name, description, url } = useMemo(() => {
            if (connectedApp.type === "in-app") {
                return {
                    name: connectedApp.app.name,
                    url: connectedApp.app.href,
                    description: connectedApp.app.desc,
                }
            } else {
                return {
                    name: connectedApp.session.peer.metadata.name,
                    description: connectedApp.session.peer.metadata.description,
                    url: connectedApp.session.peer.metadata.url,
                }
            }
        }, [connectedApp])

        const disconnectSession = useCallback(() => {
            onClose()
            onDisconnect()
        }, [onDisconnect, onClose])

        return (
            <BaseBottomSheet dynamicHeight ref={ref} onDismiss={onClose} title={LL.CONNECTED_APP_TITLE()}>
                <BaseView>
                    <BaseView mx={10}>
                        <AppInfo name={name} url={url} icon={icon} description={description} />
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseButton action={disconnectSession} title="Disconnect" />
                    <BaseSpacer height={16} />
                </BaseView>
            </BaseBottomSheet>
        )
    },
)
