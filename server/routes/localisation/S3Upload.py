import logging
import json
import boto3
import boto
from botocore.exceptions import ClientError
import sys
import os
import pandas as pd

from botocore import UNSIGNED
from botocore.client import Config

def main(argv):
    file = '/Users/13371327/Documents/Gloria/2020/RulesApp/obs-rules/server/routes/localisation/data/122.json'
    fileName='122test.json'
    #f = open(fileName, 'rb')
    #s3.Object('positioningdata', 'test.json').put(Body=open(jsondata, 'rb'))
    s3_client = boto3.client('s3', config=Config(signature_version=UNSIGNED))
    with open(fileName, 'rb') as f:
        file = f.read()
        s3_client.put_object(
            Body=file,
            Bucket='positioningdata',
            Key=fileName
        )

def readFile(path):
    print(path)


def upload_file(path, bucket, fileName, object_name=None,):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = fileName

    # Upload the file
    print('about to upload the file')
    s3_client = boto3.client('s3','','')
    s3object = s3.Object(bucket, path)
    s3object.put(
        Body=(bytes(json.dumps(json_data).encode('UTF-8')))
    )

    try:
        response = s3_client.upload_file(path, bucket, object_name)
        print(response)
    except ClientError as e:
        logging.error(e)
        return False
    return True

if __name__ == "__main__":
    main(sys.argv[1:])