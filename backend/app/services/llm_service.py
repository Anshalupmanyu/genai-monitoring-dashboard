import time
import httpx
from sqlalchemy.orm import Session

from app.models import Prompt, Metric, PromptStatus
from app.config import get_settings

settings = get_settings()


async def run_inference(
    prompt_text: str,
    model_name: str,
    user_id: int,
    db: Session,
) -> Prompt:
    """
    Send a prompt to Ollama (Mistral), measure latency and tokens,
    then persist the prompt + metrics to SQLite.
    """

    # Create the prompt record (status: pending)
    prompt = Prompt(
        user_id=user_id,
        prompt_text=prompt_text,
        model_name=model_name,
        status=PromptStatus.PENDING,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    start_time = time.perf_counter()

    try:
        # Call Ollama's /api/generate endpoint directly via httpx
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": model_name,
                    "prompt": prompt_text,
                    "stream": False,
                },
            )
            response.raise_for_status()
            result = response.json()

        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000

        # Extract response and token info from Ollama response
        response_text = result.get("response", "")
        eval_count = result.get("eval_count", 0)         # output tokens
        prompt_eval_count = result.get("prompt_eval_count", 0)  # input tokens

        # Update prompt record
        prompt.response_text = response_text
        prompt.status = PromptStatus.SUCCESS

        # Create metric record
        metric = Metric(
            prompt_id=prompt.id,
            input_tokens=prompt_eval_count,
            output_tokens=eval_count,
            total_tokens=prompt_eval_count + eval_count,
            latency_ms=round(latency_ms, 2),
            status=PromptStatus.SUCCESS,
        )
        db.add(metric)
        db.commit()
        db.refresh(prompt)

        return prompt

    except httpx.HTTPStatusError as e:
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000

        prompt.response_text = f"LLM Error: {str(e)}"
        prompt.status = PromptStatus.ERROR

        metric = Metric(
            prompt_id=prompt.id,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            latency_ms=round(latency_ms, 2),
            status=PromptStatus.ERROR,
        )
        db.add(metric)
        db.commit()
        db.refresh(prompt)
        return prompt

    except httpx.ConnectError:
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000

        prompt.response_text = "Error: Cannot connect to Ollama. Make sure Ollama is running (ollama serve)."
        prompt.status = PromptStatus.ERROR

        metric = Metric(
            prompt_id=prompt.id,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            latency_ms=round(latency_ms, 2),
            status=PromptStatus.ERROR,
        )
        db.add(metric)
        db.commit()
        db.refresh(prompt)
        return prompt

    except Exception as e:
        end_time = time.perf_counter()
        latency_ms = (end_time - start_time) * 1000

        prompt.response_text = f"Unexpected error: {str(e)}"
        prompt.status = PromptStatus.ERROR

        metric = Metric(
            prompt_id=prompt.id,
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            latency_ms=round(latency_ms, 2),
            status=PromptStatus.ERROR,
        )
        db.add(metric)
        db.commit()
        db.refresh(prompt)
        return prompt
