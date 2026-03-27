from datetime import date, timedelta

from app.models.user import User


def test_countdown_with_future_date(client, auth_headers, test_user):
    """User with a future retirement date gets days remaining."""
    response = client.get("/api/countdown/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["retirement_date"] == test_user.retirement_date.isoformat()
    assert data["days_remaining"] > 0
    assert data["is_retired"] is False


def test_countdown_already_retired(client, db, auth_headers, test_user):
    """User whose retirement date is in the past is flagged as retired."""
    test_user.retirement_date = date.today() - timedelta(days=30)
    db.commit()

    response = client.get("/api/countdown/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_retired"] is True
    assert data["days_remaining"] == 0
    assert "retired" in data["message"].lower()


def test_countdown_today(client, db, auth_headers, test_user):
    """Retirement date today means zero days, retired."""
    test_user.retirement_date = date.today()
    db.commit()

    response = client.get("/api/countdown/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_retired"] is True
    assert data["days_remaining"] == 0


def test_countdown_tomorrow(client, db, auth_headers, test_user):
    """One day to go gets the special message."""
    test_user.retirement_date = date.today() + timedelta(days=1)
    db.commit()

    response = client.get("/api/countdown/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["days_remaining"] == 1
    assert "tomorrow" in data["message"].lower()


def test_countdown_no_date_set(client, db, auth_headers, test_user):
    """User without a retirement date gets a helpful message."""
    test_user.retirement_date = None
    db.commit()

    response = client.get("/api/countdown/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["retirement_date"] is None
    assert data["days_remaining"] is None
    assert "no retirement date" in data["message"].lower()


def test_countdown_unauthenticated(client):
    """Unauthenticated request is rejected."""
    response = client.get("/api/countdown/")
    assert response.status_code == 401
