package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Hello from my DevOps Winter Arc Multi-Stage Docker Build!")
    })

    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "ok")
    })

    log.Println("Application listening on port 8080")

    log.Fatal(http.ListenAndServe(":8080", nil))
}
