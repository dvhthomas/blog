package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"sync"
)

// Results of github API query
type Results struct {
	Items []Person
}

// Person is a github user
type Person struct {
	Login  string
	Avatar string `json:"avatar_url"`
}

func getPeople() []Person {

	url := "https://api.github.com/search/users?q=followers:%3E10000+sort:followers&per_page=50"

	res, err := http.Get(url)

	if err != nil {
		panic(err.Error())
	}

	// should be checking for specific header here before trying to read
	// the body -- could have failed with overuse of API
	body, err := ioutil.ReadAll(res.Body)

	if err != nil {
		panic(err.Error())
	}

	var result Results
	json.Unmarshal([]byte(body), &result)

	// unmarshall
	return result.Items
}

func saveAvatar(p Person, wg *sync.WaitGroup) (outFile string, err error) {
	// Didn't check for headers or 403. Doh!

	outFile = fmt.Sprintf("%s.jpeg", p.Login)
	//Get the response bytes from the url
	response, err := http.Get(p.Avatar)
	if err != nil {
		return outFile, err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		return outFile, errors.New("Received non 200 response code")
	}
	//Create a empty file
	file, err := os.Create(outFile)
	if err != nil {
		return outFile, err
	}
	defer file.Close()

	//Write the bytes to the fiel
	_, err = io.Copy(file, response.Body)
	if err != nil {
		return outFile, err
	}

	defer wg.Done()
	fmt.Printf("Downloaded %s\n", outFile)
	return outFile, nil
}

// Problem statement: download the avatars of the top 50 most popular GitHub users to local files. And
// do it concurrently if you have time. And watch out for X-RateLimit-Remaining or 403s.
func main() {
	// use go run app.go to execute
	people := getPeople()
	var wg sync.WaitGroup
	for _, p := range people {
		wg.Add(1)
		go saveAvatar(p, &wg)
	}
	wg.Wait()
}
