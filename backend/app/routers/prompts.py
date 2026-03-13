from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import User, Prompt, PromptStatus
from app.schemas import PromptCreate, PromptResponse
from app.auth import get_current_user
from app.services.llm_service import run_inference

router = APIRouter(prefix="/api/prompts", tags=["Prompts"])


@router.post("/infer", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def infer_prompt(
    prompt_data: PromptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a prompt to the LLM and get a response with metrics."""
    result = await run_inference(
        prompt_text=prompt_data.prompt_text,
        model_name=prompt_data.model_name or "mistral",
        user_id=current_user.id,
        db=db,
    )
    return result


@router.get("/", response_model=list[PromptResponse])
async def get_prompts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[PromptStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get paginated prompt history for the current user."""
    query = db.query(Prompt).filter(Prompt.user_id == current_user.id)
    if status_filter:
        query = query.filter(Prompt.status == status_filter)
    prompts = query.order_by(Prompt.created_at.desc()).offset(skip).limit(limit).all()
    return prompts


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific prompt by ID."""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.user_id == current_user.id,
    ).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return prompt


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prompt(
    prompt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a prompt and its associated metrics."""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.user_id == current_user.id,
    ).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    db.delete(prompt)
    db.commit()
