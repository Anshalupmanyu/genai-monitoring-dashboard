from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import Metric, Prompt, PromptStatus, User
from app.schemas import MetricsSummary, MetricsTimeseries, MetricResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])


@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get aggregated metrics summary for the current user."""
    # Get all metrics for the user's prompts
    user_prompts = db.query(Prompt.id).filter(Prompt.user_id == current_user.id).subquery()

    metrics = db.query(Metric).filter(Metric.prompt_id.in_(user_prompts)).all()

    if not metrics:
        return MetricsSummary(
            total_prompts=0,
            total_tokens=0,
            avg_latency_ms=0.0,
            avg_tokens_per_prompt=0.0,
            success_rate=0.0,
            total_input_tokens=0,
            total_output_tokens=0,
        )

    total_prompts = len(metrics)
    total_tokens = sum(m.total_tokens for m in metrics)
    total_input_tokens = sum(m.input_tokens for m in metrics)
    total_output_tokens = sum(m.output_tokens for m in metrics)
    avg_latency = sum(m.latency_ms for m in metrics) / total_prompts
    avg_tokens = total_tokens / total_prompts
    success_count = sum(1 for m in metrics if m.status == PromptStatus.SUCCESS)
    success_rate = (success_count / total_prompts) * 100

    return MetricsSummary(
        total_prompts=total_prompts,
        total_tokens=total_tokens,
        avg_latency_ms=round(avg_latency, 2),
        avg_tokens_per_prompt=round(avg_tokens, 2),
        success_rate=round(success_rate, 2),
        total_input_tokens=total_input_tokens,
        total_output_tokens=total_output_tokens,
    )


@router.get("/timeseries", response_model=list[MetricsTimeseries])
async def get_metrics_timeseries(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get metrics timeseries data for charts."""
    user_prompts = db.query(Prompt.id).filter(Prompt.user_id == current_user.id).subquery()

    metrics = (
        db.query(Metric)
        .filter(Metric.prompt_id.in_(user_prompts))
        .order_by(Metric.created_at.asc())
        .limit(limit)
        .all()
    )

    return [
        MetricsTimeseries(
            timestamp=m.created_at,
            latency_ms=m.latency_ms,
            total_tokens=m.total_tokens,
            input_tokens=m.input_tokens,
            output_tokens=m.output_tokens,
        )
        for m in metrics
    ]


@router.get("/recent", response_model=list[MetricResponse])
async def get_recent_metrics(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the most recent metrics."""
    user_prompts = db.query(Prompt.id).filter(Prompt.user_id == current_user.id).subquery()

    metrics = (
        db.query(Metric)
        .filter(Metric.prompt_id.in_(user_prompts))
        .order_by(Metric.created_at.desc())
        .limit(limit)
        .all()
    )

    return metrics
