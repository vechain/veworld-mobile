export type Validator = {
    address: string
    name: string
    location: string
    desc: string
    website: string
    logo: string
}

const VALIDATOR_HUB_BASE_URL = "https://vechain.github.io/validator-hub"

export const ValidatorHubUrls = {
    devnet: `${VALIDATOR_HUB_BASE_URL}/devnet.json`,
    test: `${VALIDATOR_HUB_BASE_URL}/test.json`,
    main: `${VALIDATOR_HUB_BASE_URL}/main.json`,
}
