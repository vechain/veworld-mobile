import { BigNumber as BN } from "bignumber.js"
import { isEmpty } from "lodash"
import { CurrencyExchangeRate as IRate } from "~Model"

interface IBigNumberUtils {
    // utility Methods
    toHuman(decimals: number, callback?: (result: BN) => void): BigNumberUtilsType
    decimals(decimals: number, callback?: (result: BN) => void): BigNumberUtilsType
    toCurrencyFormat(decimals: number, callback?: (result: BN) => void): BigNumberUtilsType
    toCurrencyConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): BigNumberUtilsType
    toTokenConversion(balance: string, rate?: IRate, callback?: (result: BN) => void): BigNumberUtilsType
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): BigNumberUtilsType

    // Math Methods
    minus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtilsType
    plus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtilsType
    times(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtilsType
    idiv(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtilsType

    // Comparison Methods
    isLessThan(value: string | number | BN): boolean
    isBiggerThan(value: string | number | BN): boolean

    // Properties
    toString: string
    toNumber: number
    toHex: string
    isZero: boolean
}

class BigNumberUtilsType implements IBigNumberUtils {
    private data: BN

    constructor(input: string | number | BN) {
        this.data = new BN(input)
    }

    // custom initializer
    static init() {
        return new BigNumberUtilsType("0")
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

    get isZero(): boolean {
        return this.data.isZero()
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

    times(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.times(value)

        if (callback) {
            callback(this.data)
        }

        return this
    }

    idiv(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.idiv(value)

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

function BigNumberUtils(input?: string | number | BN): BigNumberUtilsType {
    if (input) {
        return new BigNumberUtilsType(input)
    } else {
        return BigNumberUtilsType.init()
    }
}

export { BigNumberUtilsType }
export default BigNumberUtils
