#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (CryptoKitManager, NSObject)

RCT_EXTERN_METHOD(generateKeyPair
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deriveSharedSecret
                  : (NSString *)privateKeyBase64 withPublicKey
                  : (NSString *)publicKeyBase64 withResolver
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(encrypt
                  : (NSString *)message withKey
                  : (NSString *)keyBase64 withResolver
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(decrypt
                  : (NSString *)encryptedBase64 withKey
                  : (NSString *)keyBase64 withNonce
                  : (NSString *)nonceBase64 withResolver
                  : (RCTPromiseResolveBlock)resolve withRejecter
                  : (RCTPromiseRejectBlock)reject)

@end