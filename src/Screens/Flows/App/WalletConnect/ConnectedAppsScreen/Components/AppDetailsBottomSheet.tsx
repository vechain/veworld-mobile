import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useMemo, useState } from "react"
import { BaseBottomSheet, BaseButton, BaseSpacer, BaseView, ScrollViewWithFooter } from "~Components"
import { useI18nContext } from "~i18n"
import { AppInfo } from "../../Components"
import { ConnectedApp } from "~Screens"

type Props = {
    onClose: () => void
    connectedApp: ConnectedApp
    onDisconnect: () => void
}

const snapPoints = ["50%"]
export const AppDetailsBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, connectedApp, onDisconnect }, ref) => {
        const [isScrollEnabled, setIsScrollEnabled] = useState(true)

        const { LL } = useI18nContext()

        const icon = useMemo(() => {
            if (connectedApp.type === "in-app") {
                return connectedApp.image
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
                }
            } else {
                return {
                    name: connectedApp.session.peer.metadata.name,
                    icon: connectedApp.session.peer.metadata.icons[0],
                    description: connectedApp.session.peer.metadata.description,
                    url: connectedApp.session.peer.metadata.url,
                }
            }
        }, [connectedApp])

        const disconnectSession = useCallback(() => {
            onClose()
            onDisconnect()
        }, [onDisconnect, onClose])

        const hanldeOnReadMore = useCallback((isDescriptionExpanded: boolean) => {
            setIsScrollEnabled(isDescriptionExpanded)
        }, [])

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref} onDismiss={onClose} title={LL.CONNECTED_APP_TITLE()}>
                <ScrollViewWithFooter
                    isScrollEnabled={isScrollEnabled}
                    footer={<BaseButton action={disconnectSession} title="Disconnect" />}>
                    <BaseView mx={10}>
                        <BaseSpacer height={16} />
                        <AppInfo
                            name={name}
                            url={url}
                            icon={icon}
                            description={description}
                            hanldeOnReadMore={hanldeOnReadMore}
                        />
                    </BaseView>
                </ScrollViewWithFooter>
            </BaseBottomSheet>
        )
    },
)
