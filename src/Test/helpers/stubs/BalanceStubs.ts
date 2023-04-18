import MockAdapter from "axios-mock-adapter"

export const mockGetBalance = (mockAdapter: MockAdapter, httpCode = 200) => {
    const regex =
        /https:\/\/vethor-node-test.vechaindev.com\/accounts\/0x[0-9a-fA-F]{40}/

    //Other accounts => 0 balance
    mockAdapter.onGet(regex).reply(httpCode, {
        balance: "0x0",
        energy: "0x0",
        hasCode: false,
    })

    //Default Account => Some balance
    mockAdapter
        .onGet(
            "https://vethor-node-test.vechaindev.com/accounts/0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        )
        .reply(httpCode, {
            balance: "0xaa89ec0ca7be516bee",
            energy: "0x152d3381bc9876587710",
            hasCode: true,
        })
}
