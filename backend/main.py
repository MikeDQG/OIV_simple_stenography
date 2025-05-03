from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def genData(data):
    return [format(ord(i), '08b') for i in data]

def modPix(pix, data):
    datalist = genData(data)
    lendata = len(datalist)
    imdata = iter(pix)
    
    for i in range(lendata):
        pixels = [value for value in next(imdata)[:3] + next(imdata)[:3] + next(imdata)[:3]]
        for j in range(8):
            if datalist[i][j] == '0' and pixels[j] % 2 != 0:
                pixels[j] -= 1
            elif datalist[i][j] == '1' and pixels[j] % 2 == 0:
                pixels[j] = pixels[j] - 1 if pixels[j] != 0 else pixels[j] + 1
        if i == lendata - 1:
            pixels[-1] |= 1
        else:
            pixels[-1] &= ~1
        yield tuple(pixels[:3])
        yield tuple(pixels[3:6])
        yield tuple(pixels[6:9])

def encode_enc(newimg, data):
    w = newimg.size[0]
    (x, y) = (0, 0)
    
    for pixel in modPix(newimg.getdata(), data):
        newimg.putpixel((x, y), pixel)
        x = 0 if x == w - 1 else x + 1
        y += 1 if x == 0 else 0

def decode_image_data(image):
    imgdata = iter(image.getdata())
    data = ""
    
    while True:
        pixels = [value for value in next(imgdata)[:3] + next(imgdata)[:3] + next(imgdata)[:3]]
        binstr = ''.join(['1' if i % 2 else '0' for i in pixels[:8]])
        data += chr(int(binstr, 2))
        if pixels[-1] % 2 != 0:
            break
    return data

@app.post("/encode")
async def encode(message: str = Form(...), image: UploadFile = Form(...)):
    input_path = os.path.join(UPLOAD_FOLDER, image.filename)
    output_path = os.path.join(UPLOAD_FOLDER, "stego_" + image.filename)

    # to odpre sliko iz requesta kot file
    with open(input_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # odpre kot sliko
    image = Image.open(input_path, 'r')
    new_image = image.copy()
    encode_enc(new_image, message)
    print(message, input_path, output_path, image.filename)
    new_image.save(output_path)

    return FileResponse(path=output_path, filename="stego_image.png", media_type="image/png")

@app.post("/decode")
async def decode(image: UploadFile = Form(...)):
    input_path = os.path.join(UPLOAD_FOLDER, "decode_" + image.filename)

    with open(input_path, "wb") as f2:
        shutil.copyfileobj(image.file, f2)

    new_image = Image.open(input_path, 'r')
    hidden_message = decode_image_data(new_image)

    # oth_msg = None
    # othimg = Image.open("uploads/stego_orig.png", 'r')
    # oth_msg = decode_image_data(othimg)

    return JSONResponse({"message": hidden_message})
    # return JSONResponse({"message": f"{hidden_message} + {oth_msg}"})

@app.get("/")
async def version():
    return JSONResponse({"everything": "ok"})