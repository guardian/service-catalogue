package main

import "testing"

func TestAccountIDFromRoleARN(t *testing.T) {
	arn := `arn:aws:iam::308506854201:role/StackSet-PrismAccess-890ffec2-14g5-44cf-PrismRole-17JA3GHYD8TOPS`
	want := "308506854201"
	got := AccountIDFromRoleARN(arn)

	if got != want {
		t.Errorf("got %s; want %s", got, want)
	}
}
