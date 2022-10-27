package store

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Store interface {
	Put(bucket string, key string, blob []byte) error
	Get(bucket string, key string) ([]byte, error)
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

func (s S3Store) Get(bucket string, key string) ([]byte, error) {
	ctx := context.Background()

	resp, err := s.Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    &key,
	})

	if err != nil {
		return nil, err
	}

	data, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	if err != nil {
		return nil, err
	}

	return data, nil
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

func (s LocalStore) Get(bucket string, key string) ([]byte, error) {
	path := fmt.Sprintf("%s/%s", bucket, key)
	data, ok := s[path]

	if !ok {
		return nil, fmt.Errorf("not found (%s)", path)
	}

	return data, nil
}

func (s LocalStore) Put(bucket string, key string, blob []byte) error {
	path := fmt.Sprintf("%s/%s", bucket, key)
	s[path] = blob
	return nil
}
