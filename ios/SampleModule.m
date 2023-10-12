//
//  SampleNativeModule.m
//  veWorldMobile
//
//  Created by Vasileios  Gkreen on 23/12/22.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>


@interface RCT_EXTERN_MODULE(SampleNativeModule, NSObject)

RCT_EXTERN_METHOD(getText: (NSString *)text
                  resolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
