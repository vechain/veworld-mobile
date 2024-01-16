import { ProposalTypes } from "@walletconnect/types/dist/types/sign-client/proposal"
import { RequestMethods } from "~Constants"
import { getSdkError } from "@walletconnect/utils"
import { ErrorResponse } from "@walletconnect/jsonrpc-types/dist/cjs/jsonrpc"

export const WCSupportedChains: ProposalTypes.RequiredNamespaces = {
    vechain: {
        methods: Object.values(RequestMethods),
        events: [],
    },
}

export const validateRequestNamespaces = (
    namespaces: Record<string, ProposalTypes.RequiredNamespace>,
): ErrorResponse | undefined => {
    const requiredNamespaces = Object.keys(namespaces)
    const supportedNamespaces = Object.keys(WCSupportedChains)

    // Validate each namespace
    for (const requiredNamespace of requiredNamespaces) {
        // Validate against supported namespaces
        if (!supportedNamespaces.includes(requiredNamespace)) {
            return getSdkError("UNSUPPORTED_CHAINS")
        }

        // Validate against the namespaces supported methods
        const requiredMethods = namespaces[requiredNamespace].methods

        for (const requiredMethod of requiredMethods) {
            if (!WCSupportedChains[requiredNamespace].methods.includes(requiredMethod)) {
                return getSdkError("UNSUPPORTED_METHODS")
            }
        }

        // Validate against the namespaces supported events
        const requiredEvents = namespaces[requiredNamespace].events

        for (const requiredEvent of requiredEvents) {
            if (!WCSupportedChains[requiredNamespace].events.includes(requiredEvent)) {
                return getSdkError("UNSUPPORTED_EVENTS")
            }
        }
    }
}
