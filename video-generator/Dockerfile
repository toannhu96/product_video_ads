FROM python:3.7.11-alpine3.14

# Unzip and ImageMagick dependencies
RUN apk update && apk add unzip imagemagick==7.0.11.13-r0

# FFMPEG dependencies
RUN apk update && apk add ffmpeg-libs==4.4-r1 ffmpeg==4.4-r1

# Create empty folder to custom credentials mapping
RUN mkdir -p /credentials

# Application code
ADD src/ /usr/src/app

# Install app
WORKDIR /usr/src/app

RUN pip install pipenv
RUN pipenv install --ignore-pipfile

ENTRYPOINT [ "pipenv", "run", "python", "main.py" ]
