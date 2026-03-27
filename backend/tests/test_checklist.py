def test_create_checklist_item(client, auth_headers):
    response = client.post("/api/checklist/", json={
        "title": "Roll over pension",
        "category": "financial",
        "description": "Transfer old workplace pension",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Roll over pension"
    assert data["category"] == "financial"
    assert data["is_completed"] is False


def test_list_checklist_items(client, auth_headers):
    # Create two items
    client.post("/api/checklist/", json={
        "title": "Update will",
        "category": "legal",
    }, headers=auth_headers)
    client.post("/api/checklist/", json={
        "title": "Book GP check-up",
        "category": "healthcare",
    }, headers=auth_headers)

    response = client.get("/api/checklist/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_by_category(client, auth_headers):
    client.post("/api/checklist/", json={
        "title": "Update will",
        "category": "legal",
    }, headers=auth_headers)
    client.post("/api/checklist/", json={
        "title": "Book GP check-up",
        "category": "healthcare",
    }, headers=auth_headers)

    response = client.get("/api/checklist/?category=legal", headers=auth_headers)
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["category"] == "legal"


def test_update_checklist_item(client, auth_headers):
    create_resp = client.post("/api/checklist/", json={
        "title": "Sort ISA",
        "category": "financial",
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    response = client.patch(f"/api/checklist/{item_id}", json={
        "is_completed": True,
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["is_completed"] is True


def test_delete_checklist_item(client, auth_headers):
    create_resp = client.post("/api/checklist/", json={
        "title": "Cancel gym membership",
        "category": "lifestyle",
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    response = client.delete(f"/api/checklist/{item_id}", headers=auth_headers)
    assert response.status_code == 204

    # Confirm it's gone
    list_resp = client.get("/api/checklist/", headers=auth_headers)
    assert len(list_resp.json()) == 0


def test_checklist_unauthenticated(client):
    response = client.get("/api/checklist/")
    assert response.status_code == 401
