package store

import (
	"bytes"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Store interface {
	Put(bucket string, key string, blob []byte) error
}

func NewS3() (S3Store, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithRegion("eu-west-1"))
	if err != nil {
		return S3Store{}, err
	}

	return S3Store{Client: s3.NewFromConfig(conf)}, nil
}

type S3Store struct {
	Client *s3.Client
}

func (s S3Store) Put(bucket string, key string, blob []byte) error {
	ctx := context.Background()
	_, err := s.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &bucket,
		Key:    &key,
		Body:   bytes.NewBuffer(blob),
	})

	return err
}

type LocalStore map[string][]byte

func (s LocalStore) Put(bucket string, key string, blob []byte) error {
	path := fmt.Sprintf("%s/%s", bucket, key)
	s[path] = blob
	return nil
}
