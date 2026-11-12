import React, { ComponentType } from "react"

// The library sizes a dynamic-height sheet to the list's content alone, cutting off anything else in the sheet.
export const ignoreContentSize = (List: ComponentType<any>) => {
    const Wrapped = ({ onContentSizeChange: _onContentSizeChange, ...props }: Record<string, unknown>) => (
        <List {...props} />
    )
    Wrapped.displayName = `IgnoreContentSize(${List.displayName ?? List.name})`
    return Wrapped
}
