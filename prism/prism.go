package prism

import (
	"encoding/json"
	"io"
	"net/http"
)

type Account struct {
	ID   string `json:"accountNumber"`
	Name string `json:"accountName"`
}

func GetAccounts() ([]Account, error) {
	prismResponse := struct {
		Data []Account `json:"data"`
	}{}

	url := "https://prism.gutools.co.uk/sources/accounts"

	resp, err := http.Get(url)
	if err != nil {
		return []Account{}, err
	}

	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return []Account{}, err
	}

	err = json.Unmarshal(data, &prismResponse)
	return prismResponse.Data, err
}
