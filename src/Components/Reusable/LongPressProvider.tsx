import ContextMenu, { ContextMenuAction } from "react-native-context-menu-view"
import React from "react"

type MenuItemProps = {
    title: string
    subtitle?: string
    systemIcon?: string
    destructive?: boolean
    disabled?: boolean
    inlineChildren?: boolean
    actions?: Array<ContextMenuAction>
}

type Props = {
    children: React.ReactNode
    items: MenuItemProps[]
    action: (itemIndex: number) => void
}

export const LongPressProvider = (props: Props) => {
    return (
        <ContextMenu
            previewBackgroundColor="transparent"
            actions={props.items}
            onPress={e => props.action(e.nativeEvent.index)}>
            {props.children}
        </ContextMenu>
    )
}
