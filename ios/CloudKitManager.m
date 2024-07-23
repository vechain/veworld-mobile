//
//  CloudKitManager.m
//  VeWorld
//
//  Created by Vasileios  Gkreen on 20/06/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "React/RCTLog.h"

@interface RCT_EXTERN_MODULE(CloudKitManager, NSObject)

RCT_EXTERN_METHOD(checkCloudKitAvailability: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(saveToCloudKit: (NSString *)rootAddress
                  data:(NSString *)data
                  walletType:(NSString *)walletType
                  firstAccountAddress:(NSString *)firstAccountAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAllFromCloudKit: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWallet: (NSString *)rootAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(saveSalt: (NSString *)rootAddress
                  salt:(NSString *)salt
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(saveIV: (NSString *)rootAddress
                  iv:(NSString *)iv
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getSalt: (NSString *)rootAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(getIV: (NSString *)rootAddress
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


@end
