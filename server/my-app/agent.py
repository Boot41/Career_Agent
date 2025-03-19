import os
import logging
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, silero, turn_detector, openai
import groq
import asyncio
import json

# Load environment variables
load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger("voice-agent")
logging.basicConfig(level=logging.INFO)

# Load the GROQ API key from the environment variable
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.error("GROQ_API_KEY is missing. Please check your .env.local file.")
    exit(1)

# Initialize the GROQ client with the API key
try:
    groq_client = groq.Client(api_key=groq_api_key)
except Exception as e:
    logger.error(f"Failed to initialize GROQ client: {e}")
    exit(1)


def prewarm(proc: JobProcess):
    """Preload models before execution to improve performance."""
    try:
        logger.info("Prewarming voice activity detector (VAD)...")
        proc.userdata["vad"] = silero.VAD.load()
        logger.info("VAD successfully preloaded.")
    except Exception as e:
        logger.error(f"Error loading VAD: {e}")
        proc.userdata["vad"] = None  # Ensure the system doesn't crash


async def entrypoint(ctx: JobContext):
    """Main function for the voice assistant."""
    try:
        logger.info(f"Connecting to room: {ctx.room.name}")
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

        # Wait for first participant
        participant = await ctx.wait_for_participant()
        logger.info(f"Participant connected: {participant.identity}")

        # Extract predefined questions from participant metadata
        metadata = json.loads(participant.metadata)
        questions = metadata.get("questions", [])

        if not questions:
            logger.warning("No questions found in participant metadata.")
            await ctx.disconnect()
            return

        logger.info(f"Extracted questions: {questions}")

        # Ensure only 5 questions are asked
        questions = questions[:5]
        questions_text = "\n".join(questions)

        # Initialize conversation context
        initial_ctx = llm.ChatContext().append(
            role="system",
            text=f"You are a voice assistant created by LiveKit. "
                 f"Your only task is to ask exactly five predefined questions provided in the metadata:\n{questions_text} "
                 "Ask one question at a time, wait for an answer, and move to the next. "
                 "Ask any kind of followup questions if needed"
                 "If the user does not respond, repeat the question once. "
                 "Then confirm the responses and say 'Thank you! Your responses have been recorded.' "
                 "Do not engage in any additional conversation."
                 "Be Friendly"
        )   

        # Initialize AI voice agent pipeline
        try:
            logger.info("Initializing AI voice pipeline...")
            agent = VoicePipelineAgent(
                vad=ctx.proc.userdata["vad"],
                stt=deepgram.STT(),
                llm=openai.LLM.with_groq(model="llama3-8b-8192"),
                tts=deepgram.TTS(),
                turn_detector=turn_detector.EOUModel(),
                min_endpointing_delay=0.5,
                max_endpointing_delay=5.0,
                chat_ctx=initial_ctx,
            )
            logger.info("Voice pipeline initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize VoicePipelineAgent: {e}")
            await ctx.disconnect()
            return

        # Start agent
        logger.info("Starting VoicePipelineAgent...")
        agent.start(ctx.room, participant)
        logger.info("Agent started. Awaiting user input...")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    # finally:
        # logger.info("Disconnecting from room...") 
        # await ctx.disconnect()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )
