import { Net } from "@vechain/connex-driver/dist/interfaces"
import { SimpleNet } from "@vechain/connex-driver"

export class CustomNet extends SimpleNet {
    constructor(baseURL: string, timeout?: number, wsTimeout?: number) {
        super(baseURL, timeout, wsTimeout)
    }

    public override async http(
        method: "GET" | "POST",
        path: string,
        params?: Net.Params,
    ): Promise<any> {
        if (!params) params = {}

        params.headers = {
            ...params.headers,
            "X-Project-Id": "veworld-mobile",
        }

        return super.http(method, path, params)
    }
}
