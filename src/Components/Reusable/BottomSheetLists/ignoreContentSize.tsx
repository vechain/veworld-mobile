import React, { ComponentType, forwardRef } from "react"

// The library sizes a dynamic-height sheet to the list's content alone, cutting off anything else in the sheet.
export const ignoreContentSize = (List: ComponentType<any>) =>
    forwardRef<unknown, { onContentSizeChange?: unknown }>(
        ({ onContentSizeChange: _onContentSizeChange, ...props }, ref) => <List ref={ref} {...props} />,
    )
