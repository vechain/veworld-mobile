//
//  CloudKitManager.swift
//  VeWorld
//
//  Created by Vasileios  Gkreen on 20/06/24.
//

import Foundation
import CloudKit


@objc(CloudKitManager)
class CloudKitManager: NSObject {
  
  private let FILE_NAME = "VEWORLD_WALLET"
  private let ROOT_ADDRESS = "rootAddress"
  private let WALLET_TYPE = "walletType"
  private let DATA = "data"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  
  @objc
  func checkCloudKitAvailability(_ resolve: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    CKContainer.default().accountStatus { (accountStatus, error) in
      if accountStatus == .available {
        print("iCloud app container and private database is available")
        resolve(true)
      } else {
        let error = NSError(domain: "", code: 200, userInfo: nil)
        reject("ICLOUD", "iCloud is not available on the device", error)
      }
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveToCloudKit(_ rootAddress: String, data: String, walletType: String,  resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let recordID = CKRecord.ID(recordName: rootAddress)
    let wallet = CKRecord(recordType: FILE_NAME, recordID: recordID)
    wallet[ROOT_ADDRESS] = rootAddress as CKRecordValue
    wallet[WALLET_TYPE] = walletType  as CKRecordValue
    wallet.encryptedValues[DATA] = data
 
    CKContainer.default().privateCloudDatabase.save(wallet) { record, error in
      if (error != nil) {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        print("Wallet saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  
  @available(iOS 15.0, *)
  @objc
  func getAllFromCloudKit(_ resolve: @escaping(RCTPromiseResolveBlock),
                              rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(value: true)
    let sort = NSSortDescriptor(key: "creationDate", ascending: false)
    let query = CKQuery(recordType: FILE_NAME, predicate: pred)
    query.sortDescriptors = [sort]
    
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys = [ROOT_ADDRESS, WALLET_TYPE, DATA]
    
    var wallets = [[AnyHashable : Any]]()
    
    operation.recordFetchedBlock = { [weak self] record in
  
      let wallet = [
        self!.ROOT_ADDRESS : record[self!.ROOT_ADDRESS] as! String,
        self!.WALLET_TYPE : record[self!.WALLET_TYPE] as! String,
        self!.DATA : record.encryptedValues[self!.DATA] as! String,
      ] as [AnyHashable : Any]
      
      
      wallets.append(wallet)
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        resolve(wallets)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  
  @available(iOS 15.0, *)
  @objc
  func getWallet(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(format: "\(ROOT_ADDRESS) == %@", rootAddress)
    let query = CKQuery(recordType: FILE_NAME, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys =  [ROOT_ADDRESS, WALLET_TYPE, DATA]
    
    var wallet: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { [weak self] record in
      wallet = [
        self!.ROOT_ADDRESS : record[self!.ROOT_ADDRESS] as! String,
        self!.WALLET_TYPE : record[self!.WALLET_TYPE] as! String,
        self!.DATA : record.encryptedValues[self!.DATA] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        resolver(wallet)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
}
