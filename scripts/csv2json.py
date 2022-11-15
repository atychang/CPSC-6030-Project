#!/usr/bin/env python3

import csv
import json


def make_json(csvFilePath, jsonFilePath):

    data = {}

    with open(csvFilePath, encoding="utf-8") as csvf:
        csvReader = csv.DictReader(csvf)

        for rows in csvReader:
            key = rows["Country"]
            data[key] = rows

    with open(jsonFilePath, "w", encoding="utf-8") as jsonf:
        jsonf.write(json.dumps(data, indent=4))


csvFilePath = "../src/datasets/2021.csv"
jsonFilePath = "2021.json"

make_json(csvFilePath, jsonFilePath)
