import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(**file**).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("SECRET_KEY")

if not SECRET_KEY:
raise ValueError("SECRET_KEY environment variable must be set.")

DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
host.strip()
for host in os.environ.get(
"ALLOWED_HOSTS",
"localhost,127.0.0.1"
).split(",")
if host.strip()
]

INSTALLED_APPS = [
"daphne",
"django.contrib.admin",
"django.contrib.auth",
"django.contrib.contenttypes",
"django.contrib.sessions",
"django.contrib.messages",
"django.contrib.staticfiles",
"rest_framework",
"rest_framework_simplejwt",
"corsheaders",
"django_filters",
"users",
"games",
"studio",
"social",
"analytics",
"ai_assistant",
"chat",
]

MIDDLEWARE = [
"django.middleware.security.SecurityMiddleware",
"whitenoise.middleware.WhiteNoiseMiddleware",
"corsheaders.middleware.CorsMiddleware",
"django.contrib.sessions.middleware.SessionMiddleware",
"django.middleware.common.CommonMiddleware",
"django.middleware.csrf.CsrfViewMiddleware",
"django.contrib.auth.middleware.AuthenticationMiddleware",
"django.contrib.messages.middleware.MessageMiddleware",
"django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
{
"BACKEND": "django.template.backends.django.DjangoTemplates",
"DIRS": [],
"APP_DIRS": True,
"OPTIONS": {
"context_processors": [
"django.template.context_processors.request",
"django.contrib.auth.context_processors.auth",
"django.contrib.messages.context_processors.messages",
],
},
},
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
DATABASES = {
"default": dj_database_url.parse(
DATABASE_URL,
conn_max_age=600,
conn_health_checks=True,
)
}
else:
DATABASES = {
"default": {
"ENGINE": "django.db.backends.sqlite3",
"NAME": BASE_DIR / "db.sqlite3",
}
}

AUTH_PASSWORD_VALIDATORS = [
{
"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
},
{
"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
},
{
"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
},
{
"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
"default": {
"BACKEND": "django.core.files.storage.FileSystemStorage",
},
"staticfiles": {
"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
"http://localhost:5173",
"http://127.0.0.1:5173",
"https://studio-guide-creator.vercel.app",
]

FRONTEND_URL = os.environ.get(
"FRONTEND_URL",
"https://studio-guide-creator.vercel.app",
)

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
"DEFAULT_AUTHENTICATION_CLASSES": [
"rest_framework_simplejwt.authentication.JWTAuthentication",
],
"DEFAULT_PERMISSION_CLASSES": [
"rest_framework.permissions.IsAuthenticatedOrReadOnly",
],
"DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
"PAGE_SIZE": 20,
"DEFAULT_FILTER_BACKENDS": [
"django_filters.rest_framework.DjangoFilterBackend",
],
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CHANNEL_LAYERS = {
"default": {
"BACKEND": "channels.layers.InMemoryChannelLayer",
},
}
