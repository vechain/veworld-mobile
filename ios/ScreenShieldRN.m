//
//  ScreenShieldRN.m
//  VeWorld
//
//  Created by Vasileios  Gkreen on 09/05/24.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "React/RCTLog.h"

@interface RCT_EXTERN_MODULE(ScreenShieldRN, NSObject)

RCT_EXTERN_METHOD(protectScreenRecording)
RCT_EXTERN_METHOD(protectScreenShot)

@end
