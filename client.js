const fetchQuotes = async() =>{
    const count = parseInt(document.getElementById("quotesNum").value);
    document.getElementsByTagName("button")[0].innerText = "Loading..."
    if(!count || count < 5 || count > 20){
        window.alert("Number of Quotes has to be number from range 5-20. Please insert correct number");
        return;
    }
    let response = await fetch("http://127.0.0.1:3000/"+count)
    let fetchedJSON = await response.json();
    let resultAsHTML = 
    `<h2>Average polarity of these quotes is ${fetchedJSON.average}.</h2>
    <h3>Positive ones: ${fetchedJSON.positiveCount}</h3>
    <h3>Negative ones: ${fetchedJSON.negativeCount}</h3>
    <h3>Neutral ones: ${fetchedJSON.neutralCount}</h3>
    <h3>Most extreme quote with polarity score of ${fetchedJSON.mostExtremePolarity} is:</h3>
    <h4> ${fetchedJSON.mostExtremeQuote} </h4>
        <table style="width:80%">
            <tr>
                <th> Quote </th>
                <th> Polarity </th>
            </tr>
            ${fetchedJSON.result.map((quoteWithPolarity) => {
                return(
                    `<tr>
                        <td> ${quoteWithPolarity.quote} </td>
                        <td> ${quoteWithPolarity.polarity} </td>
                    </tr>`
                )
            })}
        </table>
    `.replaceAll(',', '');
    document.getElementById("quotesNum").value = ""
    document.getElementById("result").innerHTML = resultAsHTML;
    document.getElementsByTagName("button")[0].innerText = "Get em!"
}