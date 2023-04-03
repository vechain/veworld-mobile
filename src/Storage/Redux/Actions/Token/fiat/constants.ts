import BigNumber from "bignumber.js"

// If the env variable isn't set, use the default
const EXCHANGE_CLIENT_AXIOS_TIMEOUT = new BigNumber(
    process.env.REACT_APP_EXCHANGE_CLIENT_AXIOS_TIMEOUT || "5000",
).toNumber()

export const EXCHANGE_CLIENT_AXIOS_OPTS = {
    timeout: EXCHANGE_CLIENT_AXIOS_TIMEOUT,
}
