from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────

class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    VIEWER = "viewer"


class PromptStatusEnum(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"


# ── Auth Schemas ───────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# ── User Schemas ───────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    role: Optional[UserRoleEnum] = None
    email: Optional[str] = None


# ── Prompt Schemas ─────────────────────────────────────

class PromptCreate(BaseModel):
    prompt_text: str = Field(..., min_length=1, max_length=5000)
    model_name: Optional[str] = "mistral"


class PromptResponse(BaseModel):
    id: int
    user_id: int
    prompt_text: str
    response_text: Optional[str]
    model_name: str
    status: PromptStatusEnum
    created_at: datetime
    metric: Optional["MetricResponse"] = None

    class Config:
        from_attributes = True


# ── Metric Schemas ─────────────────────────────────────

class MetricResponse(BaseModel):
    id: int
    prompt_id: int
    input_tokens: int
    output_tokens: int
    total_tokens: int
    latency_ms: float
    status: PromptStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True


class MetricsSummary(BaseModel):
    total_prompts: int
    total_tokens: int
    avg_latency_ms: float
    avg_tokens_per_prompt: float
    success_rate: float
    total_input_tokens: int
    total_output_tokens: int


class MetricsTimeseries(BaseModel):
    timestamp: datetime
    latency_ms: float
    total_tokens: int
    input_tokens: int
    output_tokens: int


# Resolve forward references
PromptResponse.model_rebuild()
