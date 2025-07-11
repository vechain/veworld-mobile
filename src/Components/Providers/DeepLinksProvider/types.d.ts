import { NETWORK_TYPE } from "~Model"

type ConnectionLinkParams = {
    app_name: string
    app_url?: string
    app_icon: string
    public_key: string
    redirect_url: string
    network: NETWORK_TYPE
}
