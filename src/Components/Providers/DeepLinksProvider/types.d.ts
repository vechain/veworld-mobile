export type ConnectionLinkParams = {
    app_name: string
    app_url?: string
    app_icon: string
    public_key: string
    redirect_url: string
    genesis_id: string
}

export type DisconnectParams = {
    public_key: string
    genesis_id: string
    redirect_url: string
}

export type ExternalAppRequestParams = {
    /**
     * Encoded URI of the transaction request object
     */
    request: string
    /**
     * Redirect URL to send response to the external app
     */
    redirect_url: string
}

export type SessionData = {
    app_id: string
    genesisId: string
    address: string
    timestamp: number
}
