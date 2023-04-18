import { genesises } from "~Common/Constant/Thor/ThorConstants"
import MockAdapter from "axios-mock-adapter"

export const mockGetBlock = (mockAdaptor: MockAdapter) => {
    mockAdaptor
        .onGet("http://localhost:8080/blocks/0")
        .reply(200, genesises.main)
    mockAdaptor
        .onGet("https://vethor-node.vechain.com/blocks/0")
        .reply(200, genesises.main)
}
