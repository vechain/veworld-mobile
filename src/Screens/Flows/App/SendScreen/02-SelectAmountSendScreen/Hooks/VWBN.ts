import { BigNumber as BN } from "bignumber.js"
import { isEmpty } from "lodash"
import { CurrencyExchangeRate as IRate } from "~Model"

interface IBigNumber {
    // Methods
    toHuman(decimals: number, callback?: (result: BN) => void): BigNumber
    decimals(decimals: number, callback?: (result: BN) => void): BigNumber
    minus(value: string | number | BN, callback?: (result: BN) => void): BigNumber
    isLessThan(value: string | number | BN): boolean
    toCurrencyFormat(decimals: number, callback?: (result: BN) => void): BigNumber
    toCurrencyConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): BigNumber
    toTokenConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): BigNumber
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): BigNumber

    // Properties
    toString: string
    toHex: string
}

class BigNumber implements IBigNumber {
    private data: BN

    constructor(input: string | number | BN) {
        this.data = new BN(input)
    }

    // custom initializer
    static init() {
        return new BigNumber("0")
    }

    // Properties
    get toString(): string {
        return this.data.toString()
    }

    get toHex(): string {
        return this.data.toString(16)
    }

    // Methods
    toHuman(decimals: number, callback?: (result: BN) => void): this {
        this.data = this.data.dividedBy(new BN(10).pow(decimals))

        if (callback) {
            callback(this.data)
        }

        return this
    }

    decimals(value: number, callback?: (result: BN) => void): this {
        this.data = new BN(this.data.toFixed(value))

        if (callback) {
            callback(this.data)
        }
        return this
    }

    minus(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.minus(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    isLessThan(value: string | number | BN): boolean {
        return this.data.isLessThan(value)
    }

    toCurrencyFormat(decimals: number, callback?: (result: BN) => void): this {
        BN.config({ FORMAT: { decimalSeparator: ".", groupSeparator: "," } })
        let _data = this.data.toFormat(decimals, BN.ROUND_DOWN)
        this.data = new BN(_data)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    toCurrencyConversion(balance: string, rate?: IRate, callback?: (result: BN) => void) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = rate?.rate ?? 1
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    toTokenConversion(balance: string, rate?: IRate, callback?: (result: BN) => void) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = 1 / (rate?.rate ?? 1)
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    addTrailingZeros(decimals: number, callback?: (result: BN) => void): this {
        this.data = this.data.multipliedBy(new BN(10).pow(decimals))

        if (callback) {
            callback(this.data)
        }

        return this
    }
}

function pive(input?: string | number | BN): BigNumber {
    if (input) {
        return new BigNumber(input)
    } else {
        return BigNumber.init()
    }
}

export default pive
