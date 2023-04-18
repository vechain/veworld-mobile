import MockAdapter from "axios-mock-adapter"
import { defaultNetworks } from "~Common/Constant/Thor/ThorConstants"

export const mockTransactionCall = (
    mockAdaptor: MockAdapter,
    httpCode = 200,
) => {
    for (const network of defaultNetworks) {
        for (const url of network.urls) {
            mockAdaptor.onPost(`${url}/transactions`).reply(httpCode, {
                id: "0x9bcc6526a76ae560244f698805cc001977246cb92c2b4f1e2b7a204e445409ea",
            })
        }
    }
}
