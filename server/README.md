# Django Backend Setup

## Prerequisites
- Python 3.8+
- pip
- virtualenv

## Setup Instructions
1. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies 
```bash
pip install -r requirements.txt
```

3. Run migrations
```bash
python manage.py migrate
```

4. Start development server
```bash
python manage.py runserver
```

## PostgreSQL Setup
1. Install PostgreSQL
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

2. Create Database and User
```bash
sudo -u postgres psql
# In psql prompt:
CREATE DATABASE djangoproject;
CREATE USER djangouser WITH PASSWORD 'djangopassword';
GRANT ALL PRIVILEGES ON DATABASE djangoproject TO djangouser;
\q
```

3. Update database settings in `backend/settings.py`
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'djangoproject',
        'USER': 'djangouser',
        'PASSWORD': 'djangopassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Project Structure
- `backend/`: Project configuration
- `api/`: Main application logic
