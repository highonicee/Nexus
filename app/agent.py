
import os
import json

from dotenv import load_dotenv
from groq import Groq

from app.tools import search_providers

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY is missing from your .env file."
    )

client = Groq(api_key=api_key)

MODEL = "openai/gpt-oss-20b"


def run_agent(user_message: str, history=None):
    messages = [
        {
            "role": "system",
            "content": (
                "You are Nexus, a helpful AI service-matching assistant. "
                "Help users find suitable service providers based on "
                "their service, city, budget, and preferences. "
                "Remember details from the conversation, including "
                "service, city, budget, and preferences. "
                "Ask concise follow-up questions when required details "
                "are missing. "
                "Use the search_providers tool when the user wants to "
                "find service providers and all required details are known. "
                "Pass the user's preference when one is specified. "
                "If no preference is specified, pass an empty string. "
                "Only report providers returned by the tool. "
                "If no providers match, clearly say no matching providers "
                "were found. Never invent provider names, prices, ratings, "
                "specialties, or availability. "
                "Provider records are demo data, not verified real-world "
                "business listings. Do not claim their details are verified."
            ),
        }
    ]

    if history:
        messages.extend(history)
    else:
        messages.append({
            "role": "user",
            "content": user_message,
        })

    tools = [
        {
            "type": "function",
            "function": {
                "name": "search_providers",
                "description": (
                    "Search service providers by service, city, maximum "
                    "budget in rupees, and an optional preference."
                ),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "service": {
                            "type": "string",
                            "description": (
                                "The service required, e.g. photographer "
                                "or fitness coach."
                            ),
                        },
                        "city": {
                            "type": "string",
                            "description": (
                                "The city where the service is needed."
                            ),
                        },
                        "budget": {
                            "type": "number",
                            "description": (
                                "The user's maximum budget in rupees."
                            ),
                        },
                        "preference": {
                            "type": "string",
                            "description": (
                                "Optional preference, such as wedding, "
                                "portrait, event, or product photography. "
                                "Use an empty string if none is specified."
                            ),
                        },
                    },
                    "required": [
                        "service",
                        "city",
                        "budget",
                        "preference",
                    ],
                    "additionalProperties": False,
                },
            },
        }
    ]

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0,
    )

    assistant_message = response.choices[0].message

    if not assistant_message.tool_calls:
        return (
            assistant_message.content
            or "Could you share a few more details?"
        )

    messages.append(assistant_message)

    for tool_call in assistant_message.tool_calls:
        if tool_call.function.name != "search_providers":
            continue

        try:
            arguments = json.loads(
                tool_call.function.arguments
            )

            results = search_providers(
                service=arguments["service"],
                city=arguments["city"],
                budget=arguments["budget"],
                preference=arguments["preference"],
            )

            tool_result = {
                "success": True,
                "count": len(results),
                "providers": results,
            }

        except (
            ValueError,
            KeyError,
            TypeError,
            OSError,
        ):
            tool_result = {
                "success": False,
                "count": 0,
                "providers": [],
                "message": (
                    "The provider search failed. "
                    "Do not invent or guess provider results."
                ),
            }

        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(tool_result),
        })

    final_response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0,
    )

    return (
        final_response.choices[0].message.content
        or "Sorry, I couldn't complete that search. Please try again."
    )
