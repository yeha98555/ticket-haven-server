import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup, Tag
import re
from datetime import datetime, timedelta
import pytz
from enum import Enum
import json
import uuid
from bson.objectid import ObjectId
from pymongo import MongoClient
import re
import platform
import time

# env variables
load_dotenv()
CLIENT = os.getenv("MONGODB_CONNECT_STRING")
DB = os.getenv("MONGODB_DATABASE")
COLLECTION = os.getenv("MONGODB_COLLECTION")

# constants
BASE_URL = 'https://tixcraft.com'
ACTIVITY_URL = BASE_URL + '/activity'
FIRM_ID = '61697b11c0cb54d45f7c8dcb'
EXTEND_DAYS = 30  # 將開始時間往後延長幾天(活動、場次和售票時間都會延長)

#
filter_words = ['專區', 'VIP']
taipei = pytz.timezone('Asia/Taipei')

client = MongoClient(CLIENT)
db = client[DB]
collection = db[COLLECTION]

def get_headers():
    system = platform.system()
    user_agent = ""

    if system == "Windows":
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    elif system == "Darwin":  # Mac OS X
        user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    elif system == "Linux":
        user_agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    else:
        user_agent = "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)"

    return {"user-agent": user_agent}

HREADERS = get_headers()

def convert_date_to_iso(date_string: str, end_of_day: bool=False):
    date_format = '%Y/%m/%d'
    date_object = datetime.strptime(date_string[:10], date_format)

    if end_of_day:
        date_object = date_object + timedelta(days=1) - timedelta(seconds=1)

    date_object = taipei.localize(date_object)
    date_object = date_object.astimezone(pytz.UTC)

    return date_object.isoformat()

def parse_activity_date(activity_date_string: str):
    date_strings = activity_date_string.split(' ~ ')

    if len(date_strings) == 1:
        start_date_string = date_strings[0]
        end_date_string = date_strings[0]
    else:
        start_date_string = date_strings[0]
        end_date_string = date_strings[1]

    # Convert to ISO 8601 format
    start_datetime = convert_date_to_iso(start_date_string.strip(), end_of_day=False)
    end_datetime = convert_date_to_iso(end_date_string.strip(), end_of_day=True)

    return start_datetime, end_datetime

def extract_location(activity_content_text: str):
    venue_regex = r'(?:Venue|演出地點)\s*[:：]\s*(?:<span>)?(.*?)<(?:br|span|/span)'
    venue_match = re.search(venue_regex, activity_content_text)
    venue_str = venue_match.group(1) if venue_match else None
    return venue_str

class City(Enum):
    NORTH = 0
    CENTRAL = 1
    SOUTH = 2

def get_city_code(city_str):
    city_str = city_str.lower()  # 将输入的字符串转换为小写字母，以便不区分大小写
    if any(word in city_str for word in ['台北市', '新北', 'taipei']):
        return City.NORTH.value
    elif any(word in city_str for word in ['台中', 'taichung']):
        return City.CENTRAL.value
    elif any(word in city_str for word in ['高雄', 'kaohsiung']):
        return City.SOUTH.value
    else:
        return City.NORTH.value

def parse_datetime(date, time):
    if 'AM' in time or 'PM' in time:
        if ':' in time:
            dt_str = date + ' ' + time
            dt = datetime.strptime(dt_str, '%Y/%m/%d %I:%M%p')
        else:
            dt_str = date + ' ' + time
            dt = datetime.strptime(dt_str, '%Y/%m/%d %I%p')
    else:
        dt_str = date + ' ' + time
        dt = datetime.strptime(dt_str, '%Y/%m/%d %H:%M')

    dt = taipei.localize(dt)

    dt_utc = dt.astimezone(pytz.UTC)
    return dt_utc.isoformat()

def extract_sellat(datetime_string: str):
    regex = r'(?:全面開賣：|General Sale：|售票時間：|售票日期：)\s*(\d{4}/\d{1,2}/\d{1,2})\s*\(\w+\)\s*(\d{1,2}(?::\d{2})?(?:AM|PM)?)'

    match = re.search(regex, datetime_string)
    if match:
        date = match.group(1)
        time = match.group(2)
        return parse_datetime(date, time)

    return None

def extract_events(activity_content_text: str):
    text_regex = r'(?:(演出日期：|演出時間：|Date：||Date \& Time：)).*?(?:(Venue|演出地點)\b|$)'
    match = re.search(text_regex, activity_content_text, re.DOTALL)
    activity_time_info = match.group(0) if match else None

    date_regex = r'\b(\d{4}/\d{1,2}/\d{1,2})\s*\(\w+\)\s*(\d{1,2}(?::\d{2})?(?:AM|PM)?).*?(?=\s|$)'
    # date_regex = r'\b\d{4}/\d{1,2}/\d{1,2}.*?(?=\s|$)'
    dates = re.findall(date_regex, activity_time_info)

    # Convert to ISO 8601 format
    iso_dates = []
    for date_str in dates:
        iso_dates.append(parse_datetime(date_str[0], date_str[1]))
    return iso_dates

def parse_activity(activity: Tag):
# activity title
    activity_name = activity.find('div', class_='multi_ellipsis').text.strip()
    if any(word in activity_name for word in filter_words):
        return None

    # activity datetime
    activity_datetime = activity.find('div', class_='date').text.strip()
    activity_start, activity_end = parse_activity_date(activity_datetime)

    # add extend days to activity start, end date
    activity_start = (datetime.fromisoformat(activity_start) + timedelta(days=EXTEND_DAYS)).isoformat()
    activity_end = (datetime.fromisoformat(activity_end) + timedelta(days=EXTEND_DAYS)).isoformat()

    # activity cover image
    activity_cover_image = activity.find('img')['src']

    # activity url
    activity_url = BASE_URL + activity.find('a')['href']
    activity_response = requests.get(activity_url, headers=HREADERS)
    activity_soup = BeautifulSoup(activity_response.text, 'html.parser')

    # activity content
    activity_content = activity_soup.find('div', id='intro')
    activity_content_text = str(activity_content)
    activity_content_text = activity_content_text \
                                .split("""<div class="tab-pane fade" id="intro">""")[1] \
                                .split(" <!-- start: 節目圖檔 -->")[0].strip()
    activity_content_text = activity_content_text.replace('拓元', 'TicketHaven')

    # activity notice
    activity_notice = activity_soup.find('div', id='note')
    activity_notice_text = str(activity_notice)
    activity_notice_text = activity_notice_text \
                                .split("""<div class="tab-pane fade" id="note">""")[1] \
                                .split("""<span style="font-family: 'Noto Sans TC', sans-serif; font-size: 15px;">其他購票相關問題請洽拓元客服02-8772-983""")[0].strip()
    activity_notice_text = activity_notice_text.replace('拓元', 'TicketHaven')

    # activity location (region, location, address) <- activity_content_text
    activity_location = extract_location(activity_content_text)
    if activity_location is None:
        return None
    activity_region = get_city_code(activity_location)
    if (activity_region == City.NORTH.value):
        loaction = '台北小巨蛋'
        address = '台北市南京東路四段2號'
    elif (activity_region == City.CENTRAL.value):
        loaction = '台中國家歌劇院'
        address = '台中市西屯區惠來路二段101號'
    elif (activity_region == City.SOUTH.value):
        loaction = '高雄巨蛋'
        address = '高雄市左營區博愛二路757號'

    # Update loaction to activity_content_text
    activity_content_text = activity_content_text.replace(activity_location, loaction)

    ## events ##

    # sell_at
    activity_sell_at = extract_sellat(activity_content_text)
    if activity_sell_at is None:
        return None
    # add extend days to activity sell start date
    activity_sell_at = (datetime.fromisoformat(activity_sell_at) + timedelta(days=EXTEND_DAYS)).isoformat()
    # sellend_at
    activity_sellend_at = activity_start

    # events_datetime_list
    events_datetime_list = extract_events(activity_content_text)
    if len(events_datetime_list) == 0:
        return None
    # event_list
    events_info_list = []
    for event_start in events_datetime_list:
        # add extend days to event start date
        event_start = (datetime.fromisoformat(event_start) + timedelta(days=EXTEND_DAYS)).isoformat()

        event_id = uuid.uuid4().hex[:24]
        event_end = (datetime.fromisoformat(event_start) + timedelta(hours=3)).isoformat()

        event_dict = {
            "_id": ObjectId(event_id),
            "start_at": datetime.fromisoformat(event_start),
            "end_at": datetime.fromisoformat(event_end),
            "sell_at": datetime.fromisoformat(activity_sell_at),
            "sellend_at": datetime.fromisoformat(activity_sellend_at),
            "qrcode_verify_link": uuid.uuid4().hex[:24]
        }
        events_info_list.append(event_dict)

    return {
        'name': activity_name,
        'cover_img_url': activity_cover_image,
        'start_at': datetime.fromisoformat(activity_start),
        'end_at': datetime.fromisoformat(activity_end),
        "sell_at": datetime.fromisoformat(activity_sell_at),
        'content': activity_content_text,
        'notice': activity_notice_text,
        'region': activity_region,
        'location': loaction,
        'address': address,
        'events': events_info_list
    }

def replace_ids(obj):
    if isinstance(obj, dict):
        for key in obj:
            if key == "_id" and isinstance(obj[key], dict) and "$oid" in obj[key]:
                # 用前24位替換現有的 MongoDB ObjectId
                # obj[key]["$oid"] = ObjectId(uuid.uuid4().hex[:24])
                obj[key] = ObjectId(uuid.uuid4().hex[:24])
            else:
                replace_ids(obj[key])
    elif isinstance(obj, list):
        for item in obj:
            replace_ids(item)


def add_or_update_activities():
    # Load seat from .json file
    with open('north_seats.json', 'r') as f:
        north_data = json.load(f)
    with open('south_seats.json', 'r') as f:
        south_data = json.load(f)

    response = requests.get(ACTIVITY_URL, headers=HREADERS)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the activityContainer div
    activity_container = soup.find_all('div', class_='eventContainer')

    count = 0

    for activity in activity_container:
        # Parse activity
        activity_info = parse_activity(activity)
        if activity_info is None:
            continue

        if activity_info['region'] == City.SOUTH.value:
            seat_big_img_url = 'https://static.tixcraft.com/images/activity/field/23_realive_929beb2f895a767f456049bda1738fc0.png'
            seat_small_img_url = 'https://static.tixcraft.com/images/activity/field/23_realive_929beb2f895a767f456049bda1738fc0.png'
            areas = south_data['areas']
            seat_total = 4012
        else:
            seat_big_img_url = 'https://t.kfs.io/organization_resource_files/8544/54128/2023%E5%8F%B0%E5%8C%97%E5%B0%8F%E5%B7%A8%E8%9B%8B%E7%A5%A8%E5%83%B9%E5%9C%96_0419.jpg'
            seat_small_img_url = 'https://t.kfs.io/upload_images/arena_images/2270/2023___-LIKE-A-STAR-_______-1000x1000.jpg'
            areas = north_data['areas']
            seat_total = 4012

        # Update areas uuid
        replace_ids(areas)

        # Add seats
        seat_info = {
            'areas': areas,
            'seat_big_img_url': seat_big_img_url,
            'seat_small_img_url': seat_small_img_url,
            'seat_total': seat_total
        }
        activity_info = {**activity_info, **seat_info}

        # Add firm_id
        data = {
            **activity_info,
            'firm_id': ObjectId(FIRM_ID),
            "is_published": True,
        }

        # Save to db
        result = collection.replace_one(
            {"name": data['name']},  # 查詢條件
            data,  # 要插入或替換的新文檔
            upsert=True  # 如果查詢條件沒有匹配到任何文檔，則插入一個新的文檔
        )

        # 如果更新成功，則 `matched_count` 會大於 0
        if result.matched_count > 0:
            print(data['name'] + ", document was replaced...")
        else:
            print(data['name'] + ", new document was inserted...")

        count += 1
        time.sleep(3)
        # break

    print('Add or update all activities: ', count)

def delete_all_activities():
    result = collection.delete_many({"cover_img_url": re.compile("^https://static.tixcraft.com")})
    print('Delete all activities: ', result.deleted_count)


if __name__ == '__main__':
    # delete_all_activities()
    add_or_update_activities()
