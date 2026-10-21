const http = require("http");

const PORT = Number(process.env.PORT || 3000);
const GREETING = process.env.GREETING || "Docker caching experiment!";
const APP_ENV = process.env.APP_ENV || "development";

const server = http.createServer((req, res) => {

    if (req.url === "/health") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
            status: "healthy",
            service: "winter-arc-api"
        }));
    }

    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
            message: GREETING,
            environment: APP_ENV,
            version: process.env.APP_VERSION || "1.0.0"
        }));
    }

    res.writeHead(404, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        error: "Not Found"
    }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Application running on port ${PORT}`);
});
