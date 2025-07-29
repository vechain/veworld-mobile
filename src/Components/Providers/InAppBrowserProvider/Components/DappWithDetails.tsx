import { ComponentProps, PropsWithChildren, default as React, useMemo } from "react"
import { selectFeaturedDapps, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { DappDetails } from "./DappDetails"
import { DappDetailsCard } from "./DappDetailsCard"

type Props = PropsWithChildren<Omit<ComponentProps<typeof DappDetailsCard>, "children" | "name" | "icon" | "url">> & {
    appUrl: string
    appName: string
}

export const DappWithDetails = ({ children, appName, appUrl, ...props }: Props) => {
    const allApps = useAppSelector(selectFeaturedDapps)

    const { icon, name, url } = useMemo(() => {
        const foundDapp = allApps.find(app => new URL(app.href).origin === new URL(appUrl).origin)
        if (foundDapp)
            return {
                icon: foundDapp.id
                    ? DAppUtils.getAppHubIconUrl(foundDapp.id)
                    : `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(foundDapp.href).origin}`,
                name: foundDapp.name,
                url: appUrl,
            }

        return {
            name: appName,
            url: appUrl,
            icon: `${process.env.REACT_APP_GOOGLE_FAVICON_URL}${new URL(appUrl).origin}`,
        }
    }, [allApps, appName, appUrl])

    return (
        <DappDetailsCard icon={icon} name={name} url={url} {...props}>
            {({ visible }) => <DappDetails show={visible}>{children}</DappDetails>}
        </DappDetailsCard>
    )
}
