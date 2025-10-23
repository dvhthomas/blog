import requests
import logging
import pathlib
import shutil
import os
from multiprocessing.pool import ThreadPool
import sys


# https://www.delftstack.com/howto/python/python-logging-stdout/
Log_Format = "%(levelname)s - %(message)s"
logging.basicConfig(
    stream=sys.stdout, filemode="w", format=Log_Format, level=logging.INFO
)
logger = logging.getLogger()


def call_github_api():
    URL = "https://api.github.com/search/users?q=followers:%3E10000+sort:followers&per_page=50"

    r = requests.get(URL)

    if r.status_code == 403:
        logger.warn("Hitting a GitHub API usage error")
        return {}

    data = r.json()["items"]
    return data


def get_users():
    data = call_github_api()
    users = []

    for user in data:
        u = [user["login"], user["avatar_url"]]
        users.append(u)

    logger.info(f"Found {len(users)} users")
    return users


def download_photo(login: str, avatar_url: str):
    response = requests.get(avatar_url)
    if response.status_code == 200:
        file = f"photos/{login}.jpg"
        logger.info(f"Downloading {file}...")
        with open(file, "wb") as f:
            f.write(response.content)


def downloadPhotos(users):
    dirpath = "photos"
    if os.path.exists(dirpath) and os.path.isdir(dirpath):
        shutil.rmtree(dirpath)
    p = pathlib.Path(dirpath)
    p.mkdir(parents=True, exist_ok=True)

    # starmap needs an array of arguments mapped from the list
    # one mini-list matching arguments needed by the download function
    # So the structure [['bob', 'https://picture.jpeg'], ['alice', 'https://picture2.jpeg']] *just works* in this context.
    #
    # https://stackoverflow.com/a/5442981
    ThreadPool(10).starmap(download_photo, users)


# Sequential blocking downloads
#  for u in users:
#    downloadPhoto(u['user'], u['photo'])


def main():
    users = get_users()
    downloadPhotos(users)


if __name__ == "__main__":
    main()
