import { Net } from "@vechain/connex-driver/dist/interfaces"
import { SimpleNet } from "@vechain/connex-driver"

export class CustomNet implements Net {
    private readonly simpleNet: SimpleNet

    constructor(readonly baseURL: string) {
        this.simpleNet = new SimpleNet(baseURL)
    }

    public async http(
        method: "GET" | "POST",
        path: string,
        params?: Net.Params,
    ): Promise<any> {
        if (!params) params = {}

        params.headers = {
            ...params.headers,
            "X-Project-Id": "veworld-mobile",
        }

        return this.simpleNet.http(method, path, params)
    }

    public openWebSocketReader(path: string): Net.WebSocketReader {
        return this.simpleNet.openWebSocketReader(path)
    }
}
