import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, User, ChatHistory

# Test in-memory database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_create_user(db):
    new_user = User(email="test@example.com", name="Test User", tier="free")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    assert new_user.id is not None
    assert new_user.email == "test@example.com"
    assert new_user.tier == "free"

def test_add_chat_history(db):
    new_user = User(email="test2@example.com", name="Test Chat User")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    chat_entry = ChatHistory(user_id=new_user.id, message="Hello Mentor", response="Hello! How can I help?")
    db.add(chat_entry)
    db.commit()
    db.refresh(chat_entry)

    assert chat_entry.id is not None
    assert chat_entry.user_id == new_user.id
    assert chat_entry.message == "Hello Mentor"
    assert chat_entry.response == "Hello! How can I help?"

def test_user_limit_retrieval(db):
    new_user = User(email="test3@example.com", name="Chat User")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    for i in range(10):
        db.add(ChatHistory(user_id=new_user.id, message=f"Q{i}", response=f"A{i}"))
    db.commit()

    history = db.query(ChatHistory).filter(ChatHistory.user_id == new_user.id).order_by(ChatHistory.timestamp.desc()).limit(5).all()
    assert len(history) == 5
    # Just checking that it returns successfully
