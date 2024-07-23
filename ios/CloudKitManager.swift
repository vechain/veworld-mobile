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
  private let FILE_NAME_SALT = "SALT"
  private let FILE_NAME_IV = "IV"
  private let SALT = "salt"
  private let IV = "iv"
  private let ROOT_ADDRESS = "rootAddress"
  private let WALLET_TYPE = "walletType"
  private let DATA = "data"
  private let FIRST_ACCOUNT_ADDRESS = "firstAccountAddress"
  private let CREATION_DATE = "creationDate"
  private let WALLET_ZONE = "WALLET_ZONE"
  private let SALT_ZONE = "SALT_ZONE"
  private let IV_ZONE = "IV_ZONE"
  
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
  func saveToCloudKit(_ rootAddress: String, data: String, walletType: String, firstAccountAddress: String,
                      resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.WALLET_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let wallet = CKRecord(recordType: FILE_NAME, recordID: recordID)
    wallet[ROOT_ADDRESS] = rootAddress as CKRecordValue
    wallet[WALLET_TYPE] = walletType  as CKRecordValue
    wallet[FIRST_ACCOUNT_ADDRESS] = firstAccountAddress as CKRecordValue
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
    operation.desiredKeys = [ROOT_ADDRESS, WALLET_TYPE, DATA, FIRST_ACCOUNT_ADDRESS, CREATION_DATE]
    
    var wallets = [[AnyHashable : Any]]()
    
    operation.recordFetchedBlock = { [weak self] record in
  
      let wallet = [
        self!.ROOT_ADDRESS : record[self!.ROOT_ADDRESS] as! String,
        self!.WALLET_TYPE : record[self!.WALLET_TYPE] as! String,
        self!.FIRST_ACCOUNT_ADDRESS : record[self!.FIRST_ACCOUNT_ADDRESS] as! String,
        self!.CREATION_DATE : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
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
    operation.desiredKeys =  [ROOT_ADDRESS, WALLET_TYPE, DATA, FIRST_ACCOUNT_ADDRESS, CREATION_DATE]
    
    var wallet: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { [weak self] record in
      wallet = [
        self!.ROOT_ADDRESS : record[self!.ROOT_ADDRESS] as! String,
        self!.WALLET_TYPE : record[self!.WALLET_TYPE] as! String,
        self!.FIRST_ACCOUNT_ADDRESS : record[self!.FIRST_ACCOUNT_ADDRESS] as! String,
        self!.CREATION_DATE : (record.creationDate?.timeIntervalSince1970 ?? Date().timeIntervalSince1970) as TimeInterval,
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
  
  
  
  
  
  @available(iOS 15.0, *)
  @objc
  func saveSalt(_ rootAddress: String, salt: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.SALT_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let _salt = CKRecord(recordType: FILE_NAME_SALT, recordID: recordID)
    _salt.encryptedValues[SALT] = salt
 
    CKContainer.default().privateCloudDatabase.save(_salt) { record, error in
      if (error != nil) {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        print("Salt saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func saveIV(_ rootAddress: String, iv: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.IV_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let _iv = CKRecord(recordType: FILE_NAME_IV, recordID: recordID)
    _iv.encryptedValues[IV] = iv
 
    CKContainer.default().privateCloudDatabase.save(_iv) { record, error in
      if (error != nil) {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        print("IV saved successfullt on iCloud")
        resolver(true)
      }
    }
  }
  
  
  
  @available(iOS 15.0, *)
  @objc
  func getSalt(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.SALT_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID: CKRecord.ID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: FILE_NAME_SALT, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys =  [SALT]
    
    var salt: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { [weak self] record in
      salt = [
        self!.SALT : record.encryptedValues[self!.SALT] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        resolver(salt)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func getIV(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.IV_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID: CKRecord.ID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: FILE_NAME_IV, predicate: pred)
    let operation = CKQueryOperation(query: query)
    operation.desiredKeys =  [IV]
    
    var iv: [AnyHashable : Any] = ["" : ""]
    
    operation.recordFetchedBlock = { [weak self] record in
      iv = [
        self!.IV : record.encryptedValues[self!.IV] as! String,
      ] as [AnyHashable : Any]
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        print("Internal iCloud error log: \(String(describing: error))")
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", err.localizedDescription, err)
      } else {
        resolver(iv)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteWallet(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let pred = NSPredicate(format: "\(ROOT_ADDRESS) == %@", rootAddress)
    let query = CKQuery(recordType: FILE_NAME, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
        if error != nil {
          let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
          reject("ICLOUD", "Failed to delete wallet from iCloud", err)
          print("Failed to delete wallet from iCloud")
        }
      }
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", "Error, delete wallet operation, iCloud", err)
        print("Error, delete wallet operation, iCloud")
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteSalt(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.SALT_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID: CKRecord.ID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: FILE_NAME_SALT, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
        if error != nil {
          let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
          reject("ICLOUD", "Failed to delete salt from iCloud", err)
          print("Failed to delete salt from iCloud")
        }
      }
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", "Error, delete salt operation, iCloud", err)
        print("Error, delete salt operation, iCloud")
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
  
  
  @available(iOS 15.0, *)
  @objc
  func deleteIV(_ rootAddress: String, resolver: @escaping(RCTPromiseResolveBlock), rejecter reject: @escaping(RCTPromiseRejectBlock)) -> Void {
    
    let zoneID = CKRecordZone.ID(zoneName: self.IV_ZONE, ownerName: CKCurrentUserDefaultName)
    let recordID: CKRecord.ID = CKRecord.ID(recordName: rootAddress, zoneID: zoneID)
    let pred = NSPredicate(format: "recordID=%@", recordID)
    let query = CKQuery(recordType: FILE_NAME_IV, predicate: pred)
    let operation = CKQueryOperation(query: query)
    
    operation.recordFetchedBlock = { record in
      let id = record.recordID
      
      CKContainer.default().privateCloudDatabase.delete(withRecordID: id) { record, error in
        if error != nil {
          let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
          reject("ICLOUD", "Failed to delete iv from iCloud", err)
          print("Failed to delete iv from iCloud")
        }
      }
    }
    
    operation.queryCompletionBlock = { cursor, error in
      if error != nil {
        let err = NSError(domain: error!.localizedDescription, code: 200, userInfo: nil)
        reject("ICLOUD", "Error, delete iv operation, iCloud", err)
        print("Error, delete iv operation, iCloud")
      } else {
        resolver(true)
      }
    }
    
    CKContainer.default().privateCloudDatabase.add(operation)
  }
}
