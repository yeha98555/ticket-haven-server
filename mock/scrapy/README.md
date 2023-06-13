
# Scrapy tixcraft data

## Purpose
The purpose of this application is to gather concert information from Tixcraft, perform necessary data transformations, and store the updated data in MongoDB. It provides a convenient way to manage concert data and keep it up-to-date for various regions.

## Functions
### `add_or_update_activities()`
This function performs various processing tasks on the scraped concert data. The steps involved are as follows:

1. Extraction: The function extracts concert data from the Tixcraft website.
2. Segmentation: The data is segmented based on different regions, namely North, Central, and South.
3. Region-specific Logic: Each region has its own specific data handling logic. For example, for the North region, the data from Taipei Arena and default seating areas are used. Similarly, the Central region utilizes data from the National Taichung Theater and Taipei Arena's default seating areas. The South region retrieves data from Kaohsiung Arena and default seating areas.
4. Start Time Adjustment: The concert start time is adjusted by extending it based on the EXTEND_DAYS configuration.
5. Database Update: The processed concert data is added or updated in the MongoDB database.

### `delete_all_activities()`
This function removes past concert data from the MongoDB database.

## Prerequisites
Before running this project, you must have the following installed:

- Docker (v23.0.1 or later, if development with docker env)

## Usage
To run the project, follow these steps:
```sh
docker build -t scrapy-service .
docker run scrapy-service
```
