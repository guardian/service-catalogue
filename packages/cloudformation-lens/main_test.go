package main

import "testing"

func TestSnakeCase(t *testing.T) {
	input := "abcDef"
	want := "abc-def"

	got := snakeCase(input)

	if got != want {
		t.Errorf("got %s; want %s", got, want)
	}
}
