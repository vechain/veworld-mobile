import { BigNumber as BN } from "bignumber.js"
import { isEmpty } from "lodash"

export type BigNumberable = string | number | BN | bigint | BigNumberUtils

const parseBigNumberable = (value: BigNumberable): BN.Value => {
    if (typeof value === "bigint") return value.toString()
    if (value instanceof BigNumberUtils) return value.toBN
    return value
}

interface IBigNumberUtils {
    // utility Methods
    toHuman(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    decimals(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    toCurrencyFormat_string(decimals: number, locale?: Intl.LocalesArgument): string
    toTokenFormat_string(decimals: number, locale?: Intl.LocalesArgument): string
    toCurrencyConversion(
        balance: string,
        rate?: number,
        callback?: (result: BN) => void,
        decimals?: number,
    ): { value: string; preciseValue: string; isLeesThan_0_01: boolean }
    toTokenConversion(balance: string, rate?: number, callback?: (result: BN) => void): BigNumberUtils
    addTrailingZeros(decimals: number, callback?: (result: BN) => void): BigNumberUtils
    clone(): BigNumberUtils

    // Math Methods
    minus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    plus(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    times(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    idiv(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils
    multiply(value: string | number | BN, callback?: (result: BN) => void): BigNumberUtils

    // Comparison Methods
    isLessThan(value: string | number | BN): boolean
    isBiggerThan(value: string | number | BN): boolean

    // Properties
    toString: string
    toNumber: number
    toHex: string
    isZero: boolean
    toBigInt: bigint
    toBN: BN
}

class BigNumberUtils implements IBigNumberUtils {
    private data: BN

    constructor(input: string | number | BN) {
        BN.config({ EXPONENTIAL_AT: 1e9 })
        this.data = new BN(input)
    }

    // custom initializer
    static init() {
        return new BigNumberUtils("0")
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

    get toBigInt(): bigint {
        return BigInt(this.data.decimalPlaces(0).toString())
    }

    get isZero(): boolean {
        return this.data.isZero()
    }

    get toBN(): BN {
        return new BN(this.data)
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
        this.data = new BN(this.data.toFixed(value, BN.ROUND_DOWN))

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

    multiply(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.multipliedBy(value)

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

    div(value: string | number | BN, callback?: (result: BN) => void): this {
        this.data = this.data.div(value)

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

    toCurrencyFormat_string(decimals: number, locale?: Intl.LocalesArgument): string {
        const _locale = locale ?? "en-US"
        const formatter = new Intl.NumberFormat(_locale.toString(), {
            style: "decimal",
            useGrouping: true,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })
        let _data = ""

        if (this.data.isLessThan("0.01") && !this.data.isZero()) {
            _data = `< ${formatter.format(0.01)}`
        } else {
            _data = formatter.format(this.data as unknown as bigint)
        }

        return _data
    }

    toTokenFormat_string(decimals: number, locale?: Intl.LocalesArgument): string {
        const _locale = locale ?? "en-US"
        const formatter = new Intl.NumberFormat(_locale.toString(), {
            style: "decimal",
            useGrouping: true,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })

        let _data = ""

        if (this.data.isLessThan("0.0001") && !this.data.isZero()) {
            _data = `< ${formatter.format(0.01)}`
        } else {
            const tokenBalance = new BN(this.data.toFixed(decimals, BN.ROUND_DOWN))
            _data = formatter.format(tokenBalance as unknown as bigint)
        }

        return _data
    }

    toCurrencyConversion(balance: string, rate?: number, callback?: (result: BN) => void, decimals?: number) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = rate ?? 1
        this.data = new BN(_balance).multipliedBy(_rate)

        if (callback) {
            callback(this.data)
        }

        return {
            value: this.data.isLessThan("0.01") && !this.data.isZero() ? "< 0.01" : this.data.toString(),
            preciseValue: this.data.toFixed(decimals ?? 8, BN.ROUND_DOWN),
            isLeesThan_0_01: this.data.isLessThan("0.01") && !this.data.isZero(),
        }
    }

    toTokenConversion(balance: string, rate?: number, callback?: (result: BN) => void) {
        let _balance = !isEmpty(balance) ? balance : "0"
        let _rate = 1 / (rate ?? 1)
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

    clone() {
        return new BigNumberUtils(this.data)
    }

    static min(val1: BigNumberable, val2: BigNumberable) {
        return new BigNumberUtils(BN.min(parseBigNumberable(val1), parseBigNumberable(val2)))
    }

    static average(values: BigNumberable[]) {
        return values
            .reduce<BigNumberUtils>((acc, v) => {
                const u = acc.plus(parseBigNumberable(v))
                return u
            }, BigNutils("0"))
            .div(values.length)
    }
}

function BigNutils(input?: string | number | BN): BigNumberUtils {
    if (input) {
        return new BigNumberUtils(input)
    } else {
        return BigNumberUtils.init()
    }
}

export { BigNumberUtils }
export default BigNutils
