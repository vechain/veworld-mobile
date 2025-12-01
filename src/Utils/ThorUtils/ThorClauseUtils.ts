import { ABIContract, ABIFunction, Address, Clause, TransactionClause, Units, VET } from "@vechain/sdk-core"
import { ContractCallOptions, ThorClient } from "@vechain/sdk-network"
import {
    Abi,
    AbiParameterToPrimitiveType,
    AbiParametersToPrimitiveTypes,
    AbiStateMutability,
    ExtractAbiFunction,
    ExtractAbiFunctionNames,
} from "abitype"

type ContractFunctionName<
    abi extends Abi | readonly unknown[] = Abi,
    mutability extends AbiStateMutability = AbiStateMutability,
> = ExtractAbiFunctionNames<abi extends Abi ? abi : Abi, mutability> extends infer functionName extends string
    ? [functionName] extends [never]
        ? string
        : functionName
    : string

type FunctionParameters<
    TAbi extends Abi,
    TFunctionName extends ContractFunctionName<TAbi>,
> = AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>["inputs"]>

type FunctionResults<
    TAbi extends Abi,
    TFunctionName extends ContractFunctionName<TAbi>,
> = AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>["outputs"], "outputs">

type PlainFunctionResult<
    TAbi extends Abi,
    TFunctionName extends ContractFunctionName<TAbi>,
    TFunction extends ExtractAbiFunction<TAbi, TFunctionName> = ExtractAbiFunction<TAbi, TFunctionName>,
> = TFunction["outputs"]["length"] extends 1
    ? AbiParameterToPrimitiveType<TFunction["outputs"][0]>
    : AbiParametersToPrimitiveTypes<TFunction["outputs"]>

type TypedContractClause<TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>> = {
    clause: TransactionClause
    functionAbi: ABIFunction<TAbi, TFunctionName>
}

type TypedContractCallFailure = {
    success: false
    result: {
        errorMessage: string
    }
}

type TypedContractCallSuccess<TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>> = {
    success: true
    result: {
        // Success result as a plain value (might be literal or object).
        plain: PlainFunctionResult<TAbi, TFunctionName>
        // Success result as an array (values are the same as in plain).
        array: FunctionResults<TAbi, TFunctionName>
    }
}

type TypedContractCallResult<TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>> =
    | TypedContractCallFailure
    | TypedContractCallSuccess<TAbi, TFunctionName>

type MulticallResult<TClauses extends TypedContractClause<any, any>[]> = TClauses extends [infer First, ...infer Rest]
    ? First extends TypedContractClause<infer TAbi, infer TFunctionName>
        ? [
              TypedContractCallResult<TAbi, TFunctionName>,
              ...(Rest extends TypedContractClause<any, any>[] ? MulticallResult<Rest> : []),
          ]
        : never
    : []

type MulticallResultToSuccess<TResults extends TypedContractCallResult<any, any>[]> = TResults extends [
    infer First,
    ...infer Rest,
]
    ? First extends TypedContractCallResult<infer TAbi, infer TFunctionName>
        ? [
              TypedContractCallSuccess<TAbi, TFunctionName>,
              ...(Rest extends TypedContractCallResult<any, any>[] ? MulticallResultToSuccess<Rest> : []),
          ]
        : never
    : []

interface TypedMethod<TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>> {
    fn: ABIFunction<TAbi, TFunctionName>
    asClause: (parameters: FunctionParameters<TAbi, TFunctionName>) => Clause
    asContractClause: (parameters: FunctionParameters<TAbi, TFunctionName>) => TypedContractClause<TAbi, TFunctionName>
    execute: (
        thorClient: ThorClient,
        parameters: FunctionParameters<TAbi, TFunctionName>,
        opts?: ContractCallOptions,
    ) => Promise<TypedContractCallResult<TAbi, TFunctionName>>
    _value: bigint
    value: (value: string | bigint) => this
}

/**
 * Get an object to create clauses easily and typed.
 * It can be used in place of {@link getClauseOfMethod} if you need to loop through a lot of clause creation
 * @param abi ABI of the method
 * @param contractAddress Contract address used to call
 * @param functionName Name of the function
 * @returns An object that can be used to create clauses easily and typed
 */
export const getMethod = <TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>>(
    abi: TAbi,
    contractAddress: string,
    functionName: TFunctionName,
): TypedMethod<TAbi, TFunctionName> => {
    const fn = ABIContract.ofAbi(abi).getFunction(functionName)
    return {
        _value: 0n,
        value(value: bigint | string) {
            const parsed = BigInt(value)
            this._value = parsed
            return this
        },
        asClause(parameters) {
            return Clause.callFunction(
                Address.of(contractAddress),
                fn as ABIFunction,
                parameters as unknown[],
                VET.of(this._value, Units.wei),
                {},
            )
        },
        asContractClause(parameters) {
            return {
                clause: this.asClause(parameters),
                functionAbi: fn as ABIFunction<TAbi, TFunctionName>,
            }
        },
        execute: (thorClient, parameters, opts) => {
            return thorClient.transactions.executeCall(
                contractAddress,
                fn as ABIFunction,
                parameters as unknown[],
                opts,
            ) as any
        },
        fn,
    }
}

/**
 * Get a typed clause for a method
 * @param thorClient Thor Client
 * @param contractAddress Contract address
 * @param abi ABI containing the function
 * @param functionName Function name
 * @param parameters Parameters for the clause
 * @returns The associated clause
 */
export const getClauseOfMethod = <TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>>(
    contractAddress: string,
    abi: TAbi,
    functionName: TFunctionName,
    parameters: FunctionParameters<TAbi, TFunctionName>,
) => {
    const method = getMethod(abi, contractAddress, functionName)
    return method.asClause(parameters)
}

/**
 * Get a typed contract clause for a method
 * @param thorClient Thor Client
 * @param contractAddress Contract address
 * @param abi ABI containing the function
 * @param functionName Function name
 * @param parameters Parameters for the clause
 * @returns The associated contract clause (to be used for `executeMultipleClausesCall`)
 */
export const getContractClauseOfMethod = <TAbi extends Abi, TFunctionName extends ContractFunctionName<TAbi>>(
    contractAddress: string,
    abi: TAbi,
    functionName: TFunctionName,
    parameters: FunctionParameters<TAbi, TFunctionName>,
) => {
    const method = getMethod(abi, contractAddress, functionName)
    return method.asContractClause(parameters)
}

/**
 * Execute a multiple clauses call with type safety.
 * Usually combined with {@link assertMultipleClausesCallSuccess}
 * @param thorClient Thor Client
 * @param clauses Clauses
 * @returns An array, based on the same order as clauses of results.
 * 
 * 
 * @example
 * const result = await ThorUtils.clause.executeMultipleClausesCall(thor, ThorUtils.getContractClauseOfMethod(
                config.STARGATE_NFT_CONTRACT_ADDRESS!,
                [StargateInfo.getToken],
                "getToken",
                [BigInt(node.nodeId)],
            ))
 */
export const executeMultipleClausesCall = <TClauses extends TypedContractClause<any, any>[]>(
    thorClient: ThorClient,
    ...clauses: TClauses
): Promise<MulticallResult<TClauses>> => {
    return thorClient.transactions.executeMultipleClausesCall(clauses) as any
}

/**
 * Function used in combination with {@link executeMultipleClausesCall}.
 * After this function is called, you can safely access {@link results}[<index>].result.plain
 * @param results Results returned by {@link executeMultipleClausesCall}
 * @param cb Callback to run when at least one result is not a success. It should be a strong assertion (like a throw of an error)
 *
 * @example
 * ThorUtils.clause.assertMultipleClausesCallSuccess(result, () => { throw new Error("Clause reverted") })
 */
export function assertMultipleClausesCallSuccess<TResults extends TypedContractCallResult<any, any>[]>(
    results: TResults,
    cb: () => void,
    //@ts-ignore
): asserts results is MulticallResultToSuccess<TResults> {
    if (!results.every(r => r.success)) return cb()
}
