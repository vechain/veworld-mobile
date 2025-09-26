import { ConnectedDiscoveryApp, LoginSession, SessionState } from "~Storage/Redux"
import { DiscoveryDApp } from "~Constants"
import { SessionTypes } from "@walletconnect/types"

export type DiscoveryConnectedApp = {
    app: DiscoveryDApp
    type: "in-app"
}
export type WCConnectedApp = {
    type: "wallet-connect"
    session: SessionTypes.Struct
}
export type ExternalConnectedApp = {
    type: "external-app"
    session: SessionState & { publicKey: string }
}

export type ConnectedApp = DiscoveryConnectedApp | WCConnectedApp | ExternalConnectedApp

export const mapConnectedApps = (
    apps: ConnectedDiscoveryApp[],
    appHubDapps: DiscoveryDApp[],
): DiscoveryConnectedApp[] => {
    return apps.map(sourceDapp => {
        const foundDapp = appHubDapps.find(dapp => new URL(dapp.href).hostname === sourceDapp.href)
        if (foundDapp) return { type: "in-app", app: foundDapp }
        return {
            type: "in-app",
            app: {
                name: sourceDapp.name,
                href: `https://${sourceDapp.href}`,
                desc: `https://${sourceDapp.href}`,
                isCustom: true,
                createAt: Date.now(),
                amountOfNavigations: 1,
            },
        }
    })
}

export const mapAppSessions = (
    sessions: { [appOrigin: string]: LoginSession },
    appHubDapps: DiscoveryDApp[],
): DiscoveryConnectedApp[] => {
    return Object.values(sessions).map(session => {
        const foundDapp = appHubDapps.find(dapp => new URL(dapp.href).origin === session.url)
        if (foundDapp) return { type: "in-app", app: foundDapp }
        return {
            type: "in-app",
            app: {
                name: session.name,
                href: session.url,
                desc: session.url,
                isCustom: true,
                createAt: Date.now(),
                amountOfNavigations: 1,
            },
        }
    })
}
