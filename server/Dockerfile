FROM python:3.10-slim

WORKDIR /app

# Copy requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project
COPY . .

EXPOSE 8001

CMD ["python3", "manage.py", "runserver"]