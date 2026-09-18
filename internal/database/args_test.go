package database

import (
	"reflect"
	"testing"
)

func TestCleanArgs(t *testing.T) {
	tests := []struct {
		name     string
		input    []interface{}
		expected []interface{}
	}{
		{
			name:     "empty args",
			input:    []interface{}{},
			expected: []interface{}{},
		},
		{
			name:     "primitive types unchanged",
			input:    []interface{}{"hello", 123, true, 3.14, nil},
			expected: []interface{}{"hello", 123, true, 3.14, nil},
		},
		{
			name: "map serialized to json string",
			input: []interface{}{
				"req-1",
				map[string]interface{}{"token": "secret"},
			},
			expected: []interface{}{
				"req-1",
				`{"token":"secret"}`,
			},
		},
		{
			name: "slice serialized to json string",
			input: []interface{}{
				[]interface{}{"a", "b"},
			},
			expected: []interface{}{
				`["a","b"]`,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := cleanArgs(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("cleanArgs() = %v, want %v", result, tt.expected)
			}
		})
	}
}
