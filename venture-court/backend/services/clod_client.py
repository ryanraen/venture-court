import os
from openai import OpenAI

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.environ["CLOD_API_KEY"],
            base_url="https://api.clod.io/v1",
        )
    return _client


def get_model() -> str:
    return os.environ["CLOD_SWE_MODEL"]
