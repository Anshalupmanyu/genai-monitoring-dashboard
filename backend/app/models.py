from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VIEWER = "viewer"


class PromptStatus(str, enum.Enum):
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    prompts = relationship("Prompt", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)
    model_name = Column(String(50), default="mistral")
    status = Column(Enum(PromptStatus), default=PromptStatus.PENDING)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="prompts")
    metric = relationship("Metric", back_populates="prompt", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Prompt(id={self.id}, user_id={self.user_id}, status='{self.status}')>"


class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"), unique=True, nullable=False, index=True)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    status = Column(Enum(PromptStatus), default=PromptStatus.SUCCESS)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    prompt = relationship("Prompt", back_populates="metric")

    def __repr__(self):
        return f"<Metric(id={self.id}, prompt_id={self.prompt_id}, tokens={self.total_tokens}, latency={self.latency_ms}ms)>"
