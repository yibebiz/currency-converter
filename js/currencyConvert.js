
function fetchRateFromApi(fromCurrency, toCurrency) {
  fromCurrency = encodeURIComponent(fromCurrency);
  toCurrency = encodeURIComponent(toCurrency);
  const query = `${fromCurrency}_${toCurrency}`;

  const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

  return fetch(url)
    .then(resp =>  resp.json())
    .then(myJson=> {
        dbPromise.then(db => {
          let tx = db.transaction("rates", "readwrite");
          let rateStore = tx.objectStore("rates");
          const rateValues = Object.entries(myJson)[0];
          rateStore.put(rateValues[1], rateValues[0]);
        });
    return Object.entries(myJson)[0][1];
    })
    .catch(err=> {
      console.log("Error: ", err);
      return false;
    });
}

function fetchRateFromDb(fromCode,toCode){
 return dbPromise.then(db=> {
   let tx = db.transaction("rates");
   let rateStore = tx.objectStore("rates");
   return rateStore.get(`${fromCode}_${toCode}`);

 });
}

function getCurrencyLists() {
  const url = "https://free.currencyconverterapi.com/api/v5/currencies";

  return fetch(url)
    .then(resp=> {
      //console.log(resp.clone().json());
      return resp.json();
    })
    .then(jsonData => {
      return jsonData["results"];
    })
    .catch(err => {
      console.log("Error: ", err);
      return false;
    });
}
function populateCurrencyList(currencyObject){
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

function handleConversion() {
  const ammountInput = document.getElementById("ammount").value;
  console.log(ammountInput)

  if (!ammountInput.match(/^\s*-?[1-9]\d*(\.\d)?\s*$/)) { //checking if input is not containing only numeric values.
    const msg = '<span class="error">Please enter valid ammount!</span>';
    document.getElementById("convertedValue").innerHTML = msg;
    return;
  }
  const ammount = parseFloat(ammountInput);
  const fromSelect = document.getElementById("fromSelect");
  const fromCode = fromSelect.options[fromSelect.selectedIndex].value;

  const toSelect = document.getElementById("toSelect");
  let toCode = toSelect.options[toSelect.selectedIndex].value;
  let [toText, toSymb] = toSelect.options[toSelect.selectedIndex].text.split(" ");
  let toCodeText;
  if (toSymb) {
    toCodeText = toSymb.substr(1).slice(0, -1);
  } else {
    //toCodeText = toCode + " "; //for display perpose
    toCodeText='';
  }

fetchRateFromDb(fromCode, toCode).then(resp => {
    const rateFromDb = parseFloat(resp);
    if (!isNaN(rateFromDb)) {
      const result = ammount * rateFromDb;
      document.getElementById("convertedValue").innerHTML = result;
    } 
    else {
        fetchRateFromApi(fromCode, toCode).then(resp => {
        const rateFromApi = parseFloat(resp);
        if (!isNaN(rateFromApi)) {
        const result = ammount * rateFromApi;
        document.getElementById("convertedValue").innerHTML = result;
        }
        else{
            const err='<span class="error">Error: it seems you are offline and rate is not in the local db</span>';
            document.getElementById("convertedValue").innerHTML = err;
        }
      });
    }
});

}

let dbPromise = idb.open("converter-db", 1, upgradeDb => upgradeDb.createObjectStore("rates"));

