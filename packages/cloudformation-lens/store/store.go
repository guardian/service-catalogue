package store

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type NotFound struct {
	Message string
}

func (notFound NotFound) Error() string {
	return notFound.Message
}

type Store interface {
	Put(key string, blob []byte) error

	// Returns the data, lastModified, and any error.
	Get(key string) ([]byte, time.Time, error)
}

func NewS3(bucket string) (S3Store, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithRegion("eu-west-1"))
	if err != nil {
		return S3Store{}, err
	}

	return S3Store{Client: s3.NewFromConfig(conf), Bucket: bucket}, nil
}

func NewS3FromProfile(bucket string, profile string) (S3Store, error) {
	ctx := context.Background()
	conf, err := config.LoadDefaultConfig(ctx, config.WithRegion("eu-west-1"), config.WithSharedConfigProfile(profile))
	if err != nil {
		return S3Store{}, err
	}

	return S3Store{Client: s3.NewFromConfig(conf), Bucket: bucket}, nil
}

type S3Store struct {
	Client *s3.Client
	Bucket string
}

func (s S3Store) Get(key string) ([]byte, time.Time, error) {
	ctx := context.Background()

	resp, err := s.Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: &s.Bucket,
		Key:    &key,
	})

	if err != nil {
		noSuchKey := &types.NoSuchKey{}
		if errors.As(err, &noSuchKey) {
			return nil, time.Now(), NotFound{Message: fmt.Sprintf("not found (%s)", key)}
		}

		return nil, time.Time{}, err
	}

	data, err := io.ReadAll(resp.Body)
	defer resp.Body.Close()

	if err != nil {
		return nil, time.Time{}, err
	}

	return data, *resp.LastModified, nil
}

func (s S3Store) Put(key string, blob []byte) error {
	ctx := context.Background()
	_, err := s.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: &s.Bucket,
		Key:    &key,
		Body:   bytes.NewBuffer(blob),
	})

	return err
}

type LocalRecord struct {
	LastModified time.Time
	Blob         []byte
}

type LocalStore map[string]LocalRecord

func NewLocalStore() LocalStore {
	return LocalStore{}
}

func (s LocalStore) Get(key string) ([]byte, time.Time, error) {
	data, ok := s[key]
	if !ok {
		return nil, time.Now(), NotFound{Message: fmt.Sprintf("not found (%s)", key)}
	}

	return data.Blob, data.LastModified, nil
}

func (s LocalStore) Put(key string, blob []byte) error {
	s[key] = LocalRecord{time.Now(), blob}
	return nil
}
