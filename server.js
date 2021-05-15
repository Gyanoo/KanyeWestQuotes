const http = require("http");
const fetch = require("node-fetch");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
    const quotes = [];
    const quotesWithSentiment = [];
    const requestCount = req.url.slice(1);
    let polaritySum = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let mostExtreme = { quote: "", polarity: 0 };

    const fetchSingleQuote = async () => {
        let response = await fetch("https://api.kanye.rest");
        let fetchedJSON = await response.json();
        let quote = fetchedJSON.quote;
        quotes.includes(quote) ? await fetchSingleQuote() : quotes.push(quote);
    };

    const fetchAllQuotes = async () => {
        let promises = [];
        for (let i = 0; i < requestCount; i++) {
            promises.push(fetchSingleQuote());
        }
        await Promise.all(promises);
    };

    const fetchSentiment = async (quote) => {
        let response = await fetch("https://sentim-api.herokuapp.com/api/v1/", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: quote }),
        });
        let fetchedJSON = await response.json();
        let polarity = fetchedJSON.result.polarity;
        polaritySum += polarity;
        if (Math.abs(polarity) > Math.abs(mostExtreme.polarity)) {
            mostExtreme = { quote: quote, polarity: polarity };
        }
        if (polarity > 0) {
            positiveCount++;
        } else if (polarity == 0) {
            neutralCount++;
        } else {
            negativeCount++;
        }
        quotesWithSentiment.push({
            quote: quote,
            polarity: fetchedJSON.result.polarity,
        });
    };

    const fetchAllSentiments = async () => {
        let promises = [];
        for (let i = 0; i < quotes.length; i++) {
            promises.push(fetchSentiment(quotes[i]));
        }

        await Promise.all(promises);
    };

    const main = async () => {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        });
        await fetchAllQuotes();
        await fetchAllSentiments();
        res.write(
            JSON.stringify({
                average: (polaritySum / quotes.length).toFixed(3),
                mostExtremeQuote: mostExtreme.quote,
                mostExtremePolarity: mostExtreme.polarity,
                neutralCount: neutralCount,
                positiveCount: positiveCount,
                negativeCount: negativeCount,
                result: quotesWithSentiment,
            })
        );
        res.end();
    };

    main();
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
