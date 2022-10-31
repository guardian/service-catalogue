package cache

import (
	"testing"
	"time"

	"github.com/guardian/cdk-metadata/store"
)

func TestCacheEmpty(t *testing.T) {
	store := store.NewLocalStore()
	cache := New(store)
	lastModified := time.Now()

	key := "my-item"
	want := "foo"

	fn := func() ([]byte, error) {
		return []byte(want), nil
	}

	got, err := cache.WithCache(key, lastModified, fn)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if string(got) != want {
		t.Fatalf("got %s; want %s", string(got), want)
	}

	// check in store
	gotFromStore, _, err := store.Get(key)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if string(gotFromStore) != want {
		t.Fatalf("got %s; want %s", string(gotFromStore), want)
	}
}

func TestCacheHit(t *testing.T) {
	store := store.NewLocalStore()
	cache := New(store)
	lastModified := time.Now()

	key := "my-item"
	want := "foo"

	fn := func() ([]byte, error) {
		return []byte(want), nil
	}

	fn2 := func() ([]byte, error) {
		t.Fatalf("function should never be called")
		return []byte("newer value which should be ignored"), nil
	}

	_, err := cache.WithCache(key, lastModified, fn)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got, err := cache.WithCache(key, lastModified, fn2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if string(got) != want {
		t.Fatalf("got %s; want %s", string(got), want)
	}
}

func TestCacheStale(t *testing.T) {
	store := store.NewLocalStore()
	cache := New(store)
	lastModified := time.Now()

	key := "my-item"
	stale := "foo"
	want := "bar"

	fn := func() ([]byte, error) {
		return []byte(stale), nil
	}

	fn2 := func() ([]byte, error) {
		return []byte(want), nil
	}

	_, err := cache.WithCache(key, lastModified, fn)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Hit again but with time passed
	lastModified = lastModified.Add(time.Hour * 1)
	got, err := cache.WithCache(key, lastModified, fn2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if string(got) != want {
		t.Fatalf("got %s; want %s", string(got), want)
	}
}
