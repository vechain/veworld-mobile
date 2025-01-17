import { NETWORK_TYPE } from "~Model"

type VetDomainContractAddresses = { [T in NETWORK_TYPE]: string }

export const DOMAIN_BASE = ".veworld.vet"
const MAINNET_DELEGATOR_URL = "https://vet.domains"
const TESTNET_DELEGATOR_URL = "https://sponsor-testnet.vechain.energy/by/90"

export const DELEGATOR_URL: VetDomainContractAddresses = {
    mainnet: MAINNET_DELEGATOR_URL,
    testnet: TESTNET_DELEGATOR_URL,
    solo: "",
    other: "",
}

const MAINNET_VNS_SUBDOMAIN_CONTRACT = "0xa4173c32fe8a61a8fd0d0234675b559fc360446a"
const TESTNET_VNS_SUBDOMAIN_CONTRACT = "0xe5af50e7ad1aaab4fbe4efbb2b30f764013918b3"

export const VNS_SUBDOMAIN_CONTRACT: VetDomainContractAddresses = {
    mainnet: MAINNET_VNS_SUBDOMAIN_CONTRACT,
    testnet: TESTNET_VNS_SUBDOMAIN_CONTRACT,
    solo: "",
    other: "",
}

const MAINNET_VNS_PUBLIC_RESOLVER = "0xabac49445584C8b6c1472b030B1076Ac3901D7cf"
const TESTNET_VNS_PUBLIC_RESOLVER = "0xA6eFd130085a127D090ACb0b100294aD1079EA6f"

export const VNS_PUBLIC_RESOLVER: VetDomainContractAddresses = {
    mainnet: MAINNET_VNS_PUBLIC_RESOLVER,
    testnet: TESTNET_VNS_PUBLIC_RESOLVER,
    solo: "",
    other: "",
}

const MAINNET_VNS_REGISTRAR_CONTRACT = "0x5c970901a587BA3932C835D4ae5FAE2BEa7e78Bc"
const TESTNET_VNS_REGISTRAR_CONTRACT = "0x6878f1aD5e3015310CfE5B38d7B7071C5D8818Ca"

export const VNS_REGISTRAR_CONTRACT: VetDomainContractAddresses = {
    mainnet: MAINNET_VNS_REGISTRAR_CONTRACT,
    testnet: TESTNET_VNS_REGISTRAR_CONTRACT,
    solo: "",
    other: "",
}
