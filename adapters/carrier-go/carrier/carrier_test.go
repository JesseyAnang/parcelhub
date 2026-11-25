package carrier

import (
	"context"
	"errors"
	"testing"
)

// Compile-time check that NorthPost satisfies the contract.
var _ Adapter = NorthPost{}

func TestNorthPostQuote(t *testing.T) {
	tests := []struct {
		size      string
		wantPence int
		wantErr   error
	}{
		{size: "S", wantPence: 349},
		{size: "M", wantPence: 599},
		{size: "L", wantPence: 899},
		{size: "XL", wantErr: ErrUnsupportedSize},
	}

	for _, tt := range tests {
		t.Run(tt.size, func(t *testing.T) {
			got, err := NorthPost{}.Quote(context.Background(), QuoteRequest{Size: tt.size})
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("err = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got.PricePence != tt.wantPence || got.Carrier != "northpost" {
				t.Errorf("got %+v, want carrier northpost at %d pence", got, tt.wantPence)
			}
		})
	}
}

func TestNorthPostQuoteRespectsCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := (NorthPost{}).Quote(ctx, QuoteRequest{Size: "S"}); !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v, want context.Canceled", err)
	}
}
