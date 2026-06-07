package s3adaptador

import (
	"bytes"
	"context"
	"fmt"
	"time"

	"api-usuarios/internal/dominio"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3ArchivoRepositorio struct {
	cliente *s3.Client
	bucket  string
	region  string
}

func NuevoS3ArchivoRepositorio(bucket, region string) (*S3ArchivoRepositorio, error) {
	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("error cargando config AWS: %w", err)
	}
	return &S3ArchivoRepositorio{
		cliente: s3.NewFromConfig(cfg),
		bucket:  bucket,
		region:  region,
	}, nil
}

func (r *S3ArchivoRepositorio) Guardar(archivo *dominio.Archivo, datos []byte) (string, error) {
	uploader := manager.NewUploader(r.cliente)
	_, err := uploader.Upload(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(archivo.NombreUnico),
		Body:        bytes.NewReader(datos),
		ContentType: aws.String(archivo.TipoMIME),
	})
	if err != nil {
		return "", fmt.Errorf("error subiendo a S3: %w", err)
	}
	return archivo.NombreUnico, nil
}

func (r *S3ArchivoRepositorio) Obtener(nombre string) ([]byte, error) {
	downloader := manager.NewDownloader(r.cliente)
	buf := manager.NewWriteAtBuffer([]byte{})
	_, err := downloader.Download(context.Background(), buf, &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(nombre),
	})
	if err != nil {
		return nil, dominio.ErrArchivoNoEncontrado
	}
	return buf.Bytes(), nil
}

func (r *S3ArchivoRepositorio) GenerarURLPresignada(nombre string, duracion time.Duration) (string, error) {
	presignClient := s3.NewPresignClient(r.cliente)
	req, err := presignClient.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(nombre),
	}, s3.WithPresignExpires(duracion))
	if err != nil {
		return "", fmt.Errorf("error generando URL prefirmada: %w", err)
	}
	return req.URL, nil
}
