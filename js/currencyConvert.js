function fetchRates(fromCurrency, toCurrency) {

    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    const query = `${fromCurrency}_${toCurrency}`;
    
    const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    
    return fetch(url).then(function(resp){
        //console.log(resp.clone().json());
        return resp.json();
    }).then(function(myJson){
      return myJson;
    })
    .catch(function(err){
        console.log("Error: ",err);
        return false;
    })
}
function getCurrencyLists(){
     const url = 'https://free.currencyconverterapi.com/api/v5/currencies';

     return fetch(url)
       .then(function(resp) {
         //console.log(resp.clone().json());
         return resp.json();
       }).then(function(jsonData){
           return jsonData["results"];
       })
       .catch(function(err) {
         console.log("Error: ", err);
         return false;
       });
}
function populateCurrencyList(currencyObject){
    const fromSelect = document.getElementById("fromSelect");
    

    //var i = x.selectedIndex;
    //document.getElementById("demo").innerHTML = x.options[i].text;
    for (const [key, value] of Object.entries(currencyObject)) {
        let currencySymbol=currencyObject[key]["currencySymbol"]?`  (${currencyObject[key]["currencySymbol"]})`:'';

        const fromOption = document.createElement("option");
        fromOption.text = `${key}${currencySymbol}`;
        fromOption.value = key;

        let fromSelect = document.getElementById("fromSelect");
        fromSelect.appendChild(fromOption);

         const toOption = document.createElement("option");

         toOption.text = `${key}${currencySymbol}`;
         toOption.value = key;

        let toSelect = document.getElementById("toSelect");
        toSelect.appendChild(toOption);
    }
}

function convertCurrency() {

    let conversionRate;
 
    const ammount = parseFloat(document.getElementById("ammount").value);
    const fromSelect = document.getElementById("fromSelect");
    const fromCode = fromSelect.options[fromSelect.selectedIndex].value;

    const toSelect = document.getElementById("toSelect");
    const toCode = toSelect.options[toSelect.selectedIndex].value;
    const toCodeText = toSelect.options[toSelect.selectedIndex].text;

    //TODO: if rate for the fromCode and toCode is available use it
    //check caches existence in the db
    //getCachedRate(fromCode,toCode);
    //else, fetch it from online, do the indexing and use it 
    
  fetchRates(fromCode, toCode)
    .then(function(rateJson) {
        updateCache(rateJson);
        conversionRate = parseFloat(rateJson[`${fromCode}_${toCode}`]); //rateJson is like // {USD_ETB: 27.219999}
        const result = `${toCodeText} ${ammount * conversionRate}`;
        document.getElementById("convertedValue").innerHTML = result;
    })
    .catch(function(err) {
      console.log("Error: ", err);
    });
}
function updateCache(rateJson) {
  //Cache the latest rate values
  console.log(rateJson);
}
function getCachedRate(fromCode,toCode){
    //return rate for the value of pair in db
     
}