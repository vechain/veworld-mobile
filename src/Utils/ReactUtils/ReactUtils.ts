import React from "react"

export const typedForwardRef = <T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode,
): ((props: P & React.RefAttributes<T>) => React.ReactNode) => {
    return React.forwardRef(render as any) as any
}
