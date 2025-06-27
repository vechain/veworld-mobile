import Foundation
import UIKit
import SDWebImageWebPCoder
import React

@objc(WebPImageDataDecoder)
class WebPImageDataDecoder: NSObject, RCTImageDataDecoder {

  @objc static func moduleName() -> String! {
    return "WebPImageDataDecoder"
  }

  @objc func canDecodeImageData(_ imageData: Data) -> Bool {
    return SDImageWebPCoder.shared.canDecode(from: imageData)
  }

  @objc func decodeImageData(_ imageData: Data,
                       size: CGSize,
                       scale: CGFloat,
                       resizeMode: RCTResizeMode,
                       completionHandler: @escaping RCTImageLoaderCompletionBlock) -> RCTImageLoaderCancellationBlock {

    guard let image = SDImageWebPCoder.shared.decodedImage(with: imageData, options: nil) else {
      completionHandler(nil, nil)
      return {}
    }

    completionHandler(nil, image)
    return {}
  }
}