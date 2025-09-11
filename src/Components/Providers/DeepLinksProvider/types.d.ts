import { NETWORK_TYPE } from "~Model"

type ConnectionLinkParams = {
    app_name: string
    app_url?: string
    app_icon: string
    public_key: string
    redirect_url: string
    network: NETWORK_TYPE
}

type DisconnectParams = {
    public_key: string
    network: NETWORK_TYPE
    redirect_url: string
}

type ExternalAppRequestParams = {
    /**
     * Encoded URI of the transaction request object
     */
    request: string
    /**
     * Redirect URL to send response to the external app
     */
    redirect_url: string
}
