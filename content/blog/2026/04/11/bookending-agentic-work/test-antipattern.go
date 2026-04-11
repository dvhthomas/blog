// BAD --- coupled to implementation
func TestCreateDocument_Bad(t *testing.T) {
    mockStore := &mockStore{}
    handler := &docsHandler{store: mockStore}

    req := httptest.NewRequest("POST", "/api/docs", strings.NewReader(`{"source":"d=today"}`))
    handler.createDocument(httptest.NewRecorder(), req)

    if !mockStore.CreateCalled {
        t.Error("expected store.Create to be called")
    }
}
