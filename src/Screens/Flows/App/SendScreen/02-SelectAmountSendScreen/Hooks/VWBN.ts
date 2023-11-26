import { BigNumber as BN } from "bignumber.js"
import { isEmpty } from "lodash"
import { CurrencyExchangeRate as IRate } from "~Model"

interface IVWBN {
    // Methods
    toHuman(decimals: number, callback?: (result: BN) => void): Pive
    decimals(decimals: number, callback?: (result: BN) => void): Pive
    minus(value: string | number | BN, callback?: (result: BN) => void): Pive
    isLessThan(value: string | number | BN): boolean
    toCurrencyFormat(decimals: number, callback?: (result: BN) => void): Pive
    toCurrencyConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): Pive
    toTokenConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): Pive
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): Pive
    plus(value: string | number | BN, callback?: (result: BN) => void): Pive
    isBiggerThan(value: string | number | BN): boolean

    // Properties
    toString: string
    toNumber: number
    toHex: string
}

class Pive implements IVWBN {
    private data: BN

    constructor(input: string | number | BN) {
        this.data = new BN(input)
    }

    // custom initializer
    static init() {
        return new Pive("0")
    }

    // Properties
    get toString(): string {
        return this.data.toString()
    }

    get toNumber(): number {
        return this.data.toNumber()
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

    plus(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.plus(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    isLessThan(value: string | number | BN): boolean {
        return this.data.isLessThan(value)
    }

    isBiggerThan(value: string | number | BN): boolean {
        return this.data.isGreaterThan(value)
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

function pive(input?: string | number | BN): Pive {
    if (input) {
        return new Pive(input)
    } else {
        return Pive.init()
    }
}

export { Pive }
export default pive
