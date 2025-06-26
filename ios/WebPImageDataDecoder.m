#import <React/RCTBridgeModule.h>

// This tells React Native to load the Swift class
@interface RCT_EXTERN_MODULE(WebPImageDataDecoder, NSObject)

RCT_EXTERN_METHOD(canDecodeImageData:(NSData *)imageData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(decodeImageData:(NSData *)imageData
                  size:(CGSize)size
                  scale:(CGFloat)scale
                  resizeMode:(NSInteger)resizeMode
                  completionHandler:(RCTResponseSenderBlock)completionHandler)

@end