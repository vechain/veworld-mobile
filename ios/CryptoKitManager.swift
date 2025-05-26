//
//  CryptoKitManager.swift
//  VeWorld
//
//  Created by Michael Martin on 22/05/25.
//

import CryptoKit
import Foundation
import React

@objc(CryptoKitManager)
class CryptoKitManager: NSObject {

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc(generateKeyPair:withRejecter:)
    func generateKeyPair(
        _ resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 13.0, *) {
            let keyPair: Curve25519.KeyAgreement.PrivateKey = Curve25519.KeyAgreement.PrivateKey()
            let publicKeyData: Data = keyPair.publicKey.rawRepresentation
            let privateKeyData: Data = keyPair.rawRepresentation

            let publicKeyBase64: String = publicKeyData.base64EncodedString()
            let privateKeyBase64: String = privateKeyData.base64EncodedString()

            resolve([
                "publicKey": publicKeyBase64,
                "privateKey": privateKeyBase64,
            ])
        } else {
            reject("UNSUPPORTED_IOS_VERSION", "This functionality requires iOS 13.0 or later", nil)
        }
    }

    @objc(deriveSharedSecret:withPublicKey:withResolver:withRejecter:)
    func deriveSharedSecret(
        _ privateKeyBase64: String,
        withPublicKey publicKeyBase64: String,
        withResolver resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 13.0, *) {
            do {
                guard let privateKeyData: Data = Data(base64Encoded: privateKeyBase64),
                    let publicKeyData: Data = Data(base64Encoded: publicKeyBase64)
                else {
                    reject("INVALID_KEY_FORMAT", "Keys must be base64 encoded", nil)
                    return
                }

                let privateKey: Curve25519.KeyAgreement.PrivateKey = try Curve25519.KeyAgreement
                    .PrivateKey(
                        rawRepresentation: privateKeyData)
                let publicKey: Curve25519.KeyAgreement.PublicKey = try Curve25519.KeyAgreement
                    .PublicKey(
                        rawRepresentation: publicKeyData)

                let sharedSecret: SharedSecret = try privateKey.sharedSecretFromKeyAgreement(
                    with: publicKey)

                let symmetricKey: SymmetricKey = sharedSecret.x963DerivedSymmetricKey(
                    using: SHA256.self,
                    sharedInfo: Data(),
                    outputByteCount: 32
                )

                let sharedSecretData: Data = symmetricKey.withUnsafeBytes {
                    return Data(Array($0))
                }

                resolve(["sharedSecret": sharedSecretData.base64EncodedString()])
            } catch {
                reject("KEY_DERIVATION_ERROR", error.localizedDescription, error)
            }
        } else {
            reject("UNSUPPORTED_IOS_VERSION", "This functionality requires iOS 13.0 or later", nil)
        }
    }

    @objc(encrypt:withKey:withResolver:withRejecter:)
    func encrypt(
        _ message: String,
        withKey keyBase64: String,
        withResolver resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 13.0, *) {
            do {
                guard let messageData: Data = message.data(using: .utf8),
                    let keyData: Data = Data(base64Encoded: keyBase64)
                else {
                    reject("INVALID_INPUT", "Message or key format is invalid", nil)
                    return
                }

                let key: SymmetricKey = SymmetricKey(data: keyData)

                // Generate a random nonce
                let nonce: AES.GCM.Nonce = AES.GCM.Nonce()

                // Encrypt the message
                let sealedBox: AES.GCM.SealedBox = try AES.GCM.seal(
                    messageData, using: key, nonce: nonce)

                // Combine nonce and ciphertext for transmission
                let combined: Data = nonce.withUnsafeBytes { nonceBytes -> Data in
                    return Data(nonceBytes) + sealedBox.ciphertext + sealedBox.tag
                }

                resolve([
                    "encrypted": combined.base64EncodedString(),
                    "nonce": nonce.withUnsafeBytes { nonceBytes -> Data in
                        return Data(nonceBytes)
                    }.base64EncodedString(),
                ])
            } catch {
                reject("ENCRYPTION_ERROR", error.localizedDescription, error)
            }
        } else {
            reject("UNSUPPORTED_IOS_VERSION", "This functionality requires iOS 13.0 or later", nil)
        }
    }

    @objc(decrypt:withKey:withNonce:withResolver:withRejecter:)
    func decrypt(
        _ encryptedBase64: String,
        withKey keyBase64: String,
        withNonce nonceBase64: String,
        withResolver resolve: @escaping RCTPromiseResolveBlock,
        withRejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 13.0, *) {
            do {
                guard let encryptedData: Data = Data(base64Encoded: encryptedBase64),
                    let nonceData: Data = Data(base64Encoded: nonceBase64),
                    let keyData: Data = Data(base64Encoded: keyBase64)
                else {
                    reject("INVALID_INPUT", "Encrypted data or key format is invalid", nil)
                    return
                }

                let key: SymmetricKey = SymmetricKey(data: keyData)

                let nonce: AES.GCM.Nonce = try AES.GCM.Nonce(data: nonceData)

                // Recreate the sealed box
              let sealedBox: AES.GCM.SealedBox = try AES.GCM.SealedBox(combined: encryptedData)

                // Decrypt
                let decryptedData: Data = try AES.GCM.open(sealedBox, using: key)

                guard let decryptedString: String = String(data: decryptedData, encoding: .utf8)
                else {
                    reject("DECRYPTION_ERROR", "Failed to decode decrypted data as UTF-8", nil)
                    return
                }

                resolve(["decrypted": decryptedString])
            } catch {
                reject("DECRYPTION_ERROR", error.localizedDescription, error)
            }
        } else {
            reject("UNSUPPORTED_IOS_VERSION", "This functionality requires iOS 13.0 or later", nil)
        }
    }
}
