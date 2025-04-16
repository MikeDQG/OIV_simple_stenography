from fastapi import FastAPI, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


ZERO_WIDTH_SPACE = "\u200b"  # invisible character

class StegoInput(BaseModel):
    message: str
    cover_text: str

class DecodeInput(BaseModel):
    stego_text: str

def encode_message(message: str, cover_text: str) -> str:
    binary = ''.join(format(ord(c), '08b') for c in message)
    encoded = ''.join(f"{c}{ZERO_WIDTH_SPACE if bit == '1' else ''}" for c, bit in zip(cover_text, binary.ljust(len(cover_text), '0')))
    return encoded + cover_text[len(encoded):]  # pad rest of cover

def decode_message(stego_text: str) -> str:
    bits = ['1' if c == ZERO_WIDTH_SPACE else '0' for c in stego_text if c in [' ', ZERO_WIDTH_SPACE, '\t']]
    chars = [chr(int(''.join(bits[i:i+8]), 2)) for i in range(0, len(bits), 8)]
    return ''.join(chars).strip('\x00')

@app.post("/encode")
def encode(input: StegoInput):
    stego = encode_message(input.message, input.cover_text)
    return {"stego_text": stego}

@app.post("/decode")
def decode(input: DecodeInput):
    message = decode_message(input.stego_text)
    return {"message": message}
