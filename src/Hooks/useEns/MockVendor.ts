type Clause = {
    to: string | null
    value: string | number
    data?: string
}

type TxMessage = Array<
    Clause & {
        /** comment to the clause */
        comment?: string
        /** as the hint for wallet to decode clause data */
        abi?: object
    }
>

interface TxSigningService {
    /** designate the signer address */
    signer(addr: string): this

    /** set the max allowed gas */
    gas(gas: number): this

    /** set another txid as dependency */
    dependsOn(txid: string): this

    /**
     * provides the url of web page to reveal tx related information.
     * first appearance of slice '{txid}' in the given link url will be replaced with txid.
     */
    link(url: string): this

    /** set comment for the tx content */
    comment(text: string): this

    /**
     * enable VIP-191 by providing url of web api, which provides delegation service
     * @param url the url of web api
     * @param signer hint of the delegator address
     */
    delegate(url: string, signer?: string): this

    /** register a callback function fired when the request is accepted by user wallet */
    accepted(cb: () => void): this

    /** send the request */
    request(): Promise<TxResponse>
}

type CertMessage = {
    purpose: "identification" | "agreement"
    payload: {
        type: "text"
        content: string
    }
}

type TxResponse = {
    txid: string
    signer: string
}

interface CertSigningService {
    /** designate the signer address */
    signer(addr: string): this

    /**
     * provides the url of web page to reveal cert related information.
     * first appearance of slice '{certid}' in the given link url will be replaced with certid.
     */
    link(url: string): this

    /** register a callback function fired when the request is accepted by user wallet */
    accepted(cb: () => void): this

    /** send the request */
    request(): Promise<CertResponse>
}

type CertResponse = {
    annex: {
        domain: string
        timestamp: number
        signer: string
    }
    signature: string
}

interface Vendor {
    sign(kind: "tx", msg: TxMessage): TxSigningService
    sign(kind: "cert", msg: CertMessage): CertSigningService
}

export const vendor: Vendor = {
    // @ts-ignore
    sign: function (kind: "tx" | "cert", _msg: TxMessage | CertMessage): TxSigningService | CertSigningService {
        if (kind === "tx") {
            return {
                signer: function (_addr: string): TxSigningService {
                    return this as TxSigningService
                },
                gas: function (_gas: number): TxSigningService {
                    return this as TxSigningService
                },
                dependsOn: function (_txid: string): TxSigningService {
                    return this as TxSigningService
                },
                link: function (_url: string): TxSigningService {
                    return this as TxSigningService
                },
                comment: function (_text: string): TxSigningService {
                    return this as TxSigningService
                },
                delegate: function (_url: string, _signer?: string): TxSigningService {
                    return this as TxSigningService
                },
                accepted: function (_cb: () => void): TxSigningService {
                    return this as TxSigningService
                },
                request: function (): Promise<TxResponse> {
                    return Promise.resolve({ txid: "", signer: "" })
                },
            }
        } else {
            return {
                signer: function (_addr: string): CertSigningService {
                    return this as CertSigningService
                },
                link: function (_url: string): CertSigningService {
                    return this as CertSigningService
                },
                accepted: function (_cb: () => void): CertSigningService {
                    return this as CertSigningService
                },
                request: function (): Promise<CertResponse> {
                    return Promise.resolve({ annex: { domain: "", timestamp: 0, signer: "" }, signature: "" })
                },
            }
        }
    },
}
