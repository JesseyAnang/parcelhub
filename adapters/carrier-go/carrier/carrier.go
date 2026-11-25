// Package carrier defines the contract every carrier adapter implements and
// a first adapter for the mock "NorthPost" carrier.
//
// Week 6 adds cmd/lambda, which wraps an Adapter in a Lambda handler
// (github.com/aws/aws-lambda-go) so the Step Functions journey can call it.
package carrier

import (
	"context"
	"errors"
	"fmt"
)

// QuoteRequest mirrors the booking fields in packages/shared-types.
type QuoteRequest struct {
	Size              string `json:"size"`
	SenderPostcode    string `json:"senderPostcode"`
	RecipientPostcode string `json:"recipientPostcode"`
}

// Quote is a carrier's price for a parcel, in pence to avoid floating-point money.
type Quote struct {
	Carrier      string `json:"carrier"`
	ServiceLevel string `json:"serviceLevel"`
	PricePence   int    `json:"pricePence"`
}

// Adapter is the port the journey depends on. Each carrier is one implementation.
type Adapter interface {
	Name() string
	Quote(ctx context.Context, req QuoteRequest) (Quote, error)
}

// ErrUnsupportedSize is returned when the carrier cannot take the parcel.
var ErrUnsupportedSize = errors.New("unsupported parcel size")

// NorthPost is a mock carrier with a fixed price list.
type NorthPost struct{}

var northPostPrices = map[string]int{"S": 349, "M": 599, "L": 899}

// Name returns the carrier identifier used in the adapter registry.
func (NorthPost) Name() string { return "northpost" }

// Quote prices a parcel by size.
func (n NorthPost) Quote(ctx context.Context, req QuoteRequest) (Quote, error) {
	if err := ctx.Err(); err != nil {
		return Quote{}, err
	}
	price, ok := northPostPrices[req.Size]
	if !ok {
		return Quote{}, fmt.Errorf("%s: %w: %q", n.Name(), ErrUnsupportedSize, req.Size)
	}
	return Quote{Carrier: n.Name(), ServiceLevel: "standard", PricePence: price}, nil
}
