import React from "react"
import { useVns } from "../../Hooks"

interface ChildrenFunction {
    (props: { vnsName?: string; vnsAddress?: string }): React.ReactNode
}

export const WithVns = ({
    name,
    address,
    children,
}: {
    name?: string
    address?: string
    children: ChildrenFunction
}) => {
    const { name: vnsName, address: vnsAddress } = useVns({ name, address })

    return children({ vnsName, vnsAddress })
}
