
import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agent import run_agent
from app.memory import init_db, save_message, get_history
from app.tools import search_providers


# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Nexus API",
    description=(
        "An AI-powered service-matching assistant "
        "with provider search and conversation memory."
    ),
    version="1.0.0",
)


# --------------------------------------------------
# CORS: Allow the local React frontend to connect
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# --------------------------------------------------
# Database initialization
# --------------------------------------------------

@app.on_event("startup")
def startup():
    init_db()
    logger.info("Nexus database initialized.")


# --------------------------------------------------
# Home endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Nexus is running!",
        "status": "success",
        "version": "1.0.0",
    }


# --------------------------------------------------
# Provider search endpoint
# --------------------------------------------------

@app.get("/search")
def search(
    service: str = Query(min_length=1, max_length=100),
    city: str = Query(min_length=1, max_length=100),
    budget: float = Query(ge=0),
    preference: str = Query(default="", max_length=100),
):
    try:
        results = search_providers(
            service=service,
            city=city,
            budget=budget,
            preference=preference,
        )

        return {
            "count": len(results),
            "providers": results,
        }

    except (OSError, ValueError, KeyError, TypeError):
        logger.exception("Provider search failed")

        raise HTTPException(
            status_code=500,
            detail="Provider search failed. Please try again.",
        )


# --------------------------------------------------
# Chat request model
# --------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    conversation_id: str = Field(
        default="default",
        min_length=1,
        max_length=100,
    )


# --------------------------------------------------
# AI chat endpoint
# --------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):
    conversation_id = request.conversation_id.strip()
    message = request.message.strip()

    if not conversation_id or not message:
        raise HTTPException(
            status_code=400,
            detail="Message and conversation ID cannot be empty.",
        )

    try:
        # 1. Retrieve previous conversation messages.
        history = get_history(conversation_id)

        # 2. Save the current user message.
        save_message(
            conversation_id,
            "user",
            message,
        )

        # 3. Add the current message to the agent's context.
        history.append({
            "role": "user",
            "content": message,
        })

        # 4. Run Nexus with the conversation history.
        reply = run_agent(
            message,
            history=history,
        )

        if not reply:
            reply = (
                "Sorry, I couldn't generate a response. "
                "Please try again."
            )

        # 5. Save the assistant's reply for future messages.
        save_message(
            conversation_id,
            "assistant",
            reply,
        )

        # 6. Return the response to React.
        return {
            "reply": reply,
            "conversation_id": conversation_id,
        }

    except Exception:
        logger.exception("Failed to process Nexus chat request")

        raise HTTPException(
            status_code=500,
            detail=(
                "Nexus encountered an error. "
                "Please check the backend terminal and try again."
            ),
        )
