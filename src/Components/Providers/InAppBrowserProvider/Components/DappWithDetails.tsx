import { ComponentProps, PropsWithChildren, default as React } from "react"
import { DappDetails } from "./DappDetails"
import { DappDetailsCard } from "./DappDetailsCard"

type Props = PropsWithChildren<Omit<ComponentProps<typeof DappDetailsCard>, "children">>

export const DappWithDetails = ({ children, ...props }: Props) => {
    return (
        <DappDetailsCard {...props}>
            {({ visible }) => <DappDetails show={visible}>{children}</DappDetails>}
        </DappDetailsCard>
    )
}
