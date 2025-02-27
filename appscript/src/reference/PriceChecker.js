/*
Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
    This script is not used anymore, these functions are here as example in
    case anyone need to implement periodic price change checks and take action
    when it happens.
*/

// Return all unique product IDs being used by all campaigns on 'Campaign' sheet
function findProductsBeingUsed(productsVideo) { 
  
    var productsBeingUsed = new Set()
    
    productsVideo.forEach(function(e) {
    
        var productId = e[0]
      
        if (productId == '')
          return
                    
        String(productId).split(',')
          .forEach(function(s) { 
            productsBeingUsed.add(s.trim()) 
          })                  
    })
  
    var response = []
    productsBeingUsed.forEach(function(e) {
      response.push(e)
    })
    
    Log.output('Produts being used: ' + response)
    
    return response
  }
  
  // Include new poducts to 'Prices' sheet
  function includeNewProducts(untrackedProducts, trackedProductsLength, productsPrice, productsRange) {
  
    var row = trackedProductsLength
    var productsValues = productsRange.getValues()
    
    Log.output('Untracked products: ' + untrackedProducts)
    
    untrackedProducts.forEach(function(id) {
      
      if (!productsPrice[id])
        return
        
      productsValues[row++] = [id].concat(objectToArray(productsPrice[id]))
    })
    
    productsRange.setValues(productsValues)
  }
  
  // Update all values to products with price change on 'Price' sheet
  // Returns a list of product IDs that have changed in price
  function updatePrices(productsPrice, productsRange) {
  
    var updatedProducts = []
    var products = productsRange.getValues()
    
    for (var row = 0; row < products.length; row++) {
      
      var id = products[row][0]
      var price = products[row][2]
      
      if (id == '' || !productsPrice[id])
        break
        
      if (price != productsPrice[id].price) {
        
        Log.output('Found different prices to ' + id + ': ' + price + ' and ' + productsPrice[id].price)
        
        products[row] = [id].concat(objectToArray(productsPrice[id]))
        updatedProducts.push(String(id))
      }
    }
    
    productsRange.setValues(products)
    
    return updatedProducts
  }
  
  // Helper to find all rows in 'Campaigns' sheet which have products
  // with price changes
  function findUpdatedLines(productsVideoRange, updatedProducts) {
  
    var productLines = {}
    
    // Populate productLines mapping products and trix lines
    productsVideoValues = productsVideoRange.getValues()
    
    for (var row = 0; row < productsVideoValues.length; row++) {
      
      productIds = productsVideoValues[row][0]
      
      if (productIds == '')
        break
      
      String(productIds).split(',').forEach(function(e) {
        
        if (!productLines[e.trim()])
          productLines[e.trim()] = []
          
        productLines[e.trim()].push(row)
      })
    }
    
    var updatedLines = new Set()
    
    // Find updated lines
    updatedProducts.forEach(function(e) {
      
       var rows = productLines[e]            
        
       if (rows)
         rows.forEach(function(e) {
           updatedLines.add(e)
         })
    })
    
    return updatedLines
  }
  
  // Update 'CurrentPrices' and 'Status' accordingly
  function updateStatusAndCurrentPrices(currentPricesRange, doNotTrackPrice, campaignStatusRange, productsInUse, trackedProductsPrice, updatedLines) {
  
    var doNotTrackPriceValues = doNotTrackPrice.getValues()
    var currentPricesValues = currentPricesRange.getValues()
    var campaignStatusValues = campaignStatusRange.getValues()
    
    // Go throgh all lines
    for (var row = 0; row < productsInUse.length; row++) {
      
      var status = campaignStatusValues[row][0]
     
      // Line has changed prices or it's a new line
      if (updatedLines.has(row) || status == 'On' || status == 'On (Preview)') {
        
        Log.output('Updating line ' + row)
        
        // Update current prices
        currentPricesValues[row][0] = String(productsInUse[row][0])
          .split(',')
        .filter(function(f) { 
          return f.trim() != '' 
        })
        .map(function(u) {
          return trackedProductsPrice[u.trim()] == undefined ? '' : trackedProductsPrice[u.trim()].price
        })
        .join(',')
  
        campaignStatusValues[row][0] = findNextStatus(status, doNotTrackPriceValues[row][0])
       }
    } 
    
    currentPricesRange.setValues(currentPricesValues)
    campaignStatusRange.setValues(campaignStatusValues)
  }
  
  function findNextStatus(currentStatus, doNotTrackPrice) {
  
    switch (currentStatus) {
     
      case 'On':
        return 'Products Ready'
  
      case 'On (Preview)':
        return 'Preview'
  
      case 'Done':
        return 'Done'
  
      default:
        
        if (doNotTrackPrice != '')
          return currentStatus
        
        return 'Price Changed'
    }
  }