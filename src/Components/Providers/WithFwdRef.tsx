import React from "react"

// HOC function
export const withForwardRef = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const ForwardRefComponent = (props: P, ref: React.Ref<any>) => {
        return <WrappedComponent {...props} ref={ref} />
    }

    // Assign a display name for easier debugging
    const name = WrappedComponent.displayName || WrappedComponent.name || "Component"
    ForwardRefComponent.displayName = `withForwardRef(${name})`

    return React.forwardRef(ForwardRefComponent)
}
