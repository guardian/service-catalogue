package cache

import (
	"errors"
	"log"
	"time"

	"github.com/guardian/cdk-metadata/store"
)

type Cache interface {
	// WithCache will serve content from cache for the specified key if found
	// and not stale. Otherwise it will run `fn`, populate the cache with the
	// result, and return it. Errors short-circuit things.
	WithCache(key string, modifiedAt time.Time, fn func() ([]byte, error)) ([]byte, error)
}

type StoreCache struct {
	store store.Store
}

func New(store store.Store) StoreCache {
	return StoreCache{store: store}
}

func (cache StoreCache) WithCache(key string, modifiedAt time.Time, fn func() ([]byte, error)) ([]byte, error) {
	refresh := func() ([]byte, error) {
		got, err := fn()
		if err != nil {
			return nil, err
		}

		return got, cache.store.Put(key, got)
	}

	resp, lastModified, err := cache.store.Get(key)

	if err != nil {
		if isNotFound(err) {
			log.Printf("cache: '%s' does not exist in cache populating.\n", key)
			return refresh()
		}

		return nil, err
	}

	isStale := modifiedAt.After(lastModified)
	if isStale {
		log.Printf("cache: '%s' is stale so refreshing.\n", key)
		return refresh()
	}

	log.Printf("cache '%s' is fresh so returning.\n", key)
	return resp, nil
}

func isNotFound(err error) bool {
	var notFound store.NotFound
	return errors.As(err, &notFound)
}
