

***Build***

**Docker build&run**
docker-compose up --build

**Manual build&run:**

BACKEND
cd ./backend
pip install --no-cache-dir -r requirements.txt
uvicorn main:app --port 8000

FRONTEND
cd ./frontend
npm install
npm run dev