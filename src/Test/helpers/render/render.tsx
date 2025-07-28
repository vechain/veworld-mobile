import { render, RenderOptions } from "@testing-library/react-native"
import * as React from "react"

type RenderOptionsTyped<TProps> = Omit<RenderOptions, "wrapper"> & {
    wrapper?: React.ComponentType<TProps>
    initialProps?: TProps
}

export const renderComponentWithProps = <TElementProps, TWrapperProps>(
    component: React.ReactElement<TElementProps>,
    options?: RenderOptionsTyped<TWrapperProps>,
) => {
    const Wrapper = options?.wrapper
    return render(component, {
        ...options,
        ...(Wrapper && {
            wrapper: ({ children }) => <Wrapper {...(options?.initialProps as any)}>{children}</Wrapper>,
        }),
    })
}
